import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { propertyApi } from '../../services/propertyApi';
import type { Property } from '../../types/property';

const Wrapper = styled.div`
  position: relative;
  min-width: 200px;
  flex: 1;
  max-width: 280px;
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  font-size: 0.9375rem;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  box-sizing: border-box;
`;
const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 220px;
  overflow-y: auto;
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
`;
const Option = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  font-size: 0.875rem;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  &:last-child { border-bottom: none; }
  &:hover { background: ${p => p.theme.colors.backgroundSecondary}; }
`;
const OptionManual = styled(Option)`
  color: ${p => p.theme.colors.textSecondary};
  font-style: italic;
`;

/** Aguarda o usuário parar de digitar antes de buscar (evita chamadas em loop). */
const DEBOUNCE_MS = 2000;

interface PropertySearchSelectProps {
  value: string | undefined;
  displayLabel?: string;
  onSelect: (propertyId: string | undefined, property?: Property) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const PropertySearchSelect: React.FC<PropertySearchSelectProps> = ({
  value,
  displayLabel,
  onSelect,
  disabled,
  placeholder = 'Buscar por nome, código ou CEP...',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProperties = useCallback(async (term: string) => {
    if (!term.trim()) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await propertyApi.getProperties(
        { search: term.trim() },
        { page: 1, limit: 25 },
        false
      );
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setItems([]);
      return;
    }
    debounceRef.current = setTimeout(() => fetchProperties(query), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchProperties]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (prop: Property | null) => {
    if (prop) {
      onSelect(prop.id, prop);
      setQuery('');
    } else {
      onSelect(undefined);
      setQuery('');
    }
    setOpen(false);
  };

  const inputDisplay = open ? query : (displayLabel || '');
  const showDropdown = open && (query.length >= 1 || items.length > 0);
  const inputDisabled = disabled || loading;

  return (
    <Wrapper ref={wrapperRef}>
      <SearchInput
        type="text"
        value={inputDisplay}
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={loading ? 'Buscando...' : placeholder}
        disabled={inputDisabled}
        title={loading ? 'Aguarde a busca terminar' : undefined}
      />
      {showDropdown && (
        <Dropdown>
          {!query.trim() && (
            <OptionManual onClick={() => handleSelect(null)}>
              Digite endereço manualmente
            </OptionManual>
          )}
          {query.trim() && loading && (
            <Option style={{ cursor: 'default' }}>Buscando...</Option>
          )}
          {query.trim() && !loading && items.length === 0 && (
            <Option style={{ cursor: 'default', color: 'var(--theme-text-secondary)' }}>
              Nenhum imóvel encontrado
            </Option>
          )}
          {items.map(prop => (
            <Option key={prop.id} onClick={() => handleSelect(prop)}>
              {prop.code ? <strong>{prop.code}</strong> : null}
              {prop.code ? ' – ' : ''}
              {prop.title || prop.address}
              {prop.zipCode ? ` · CEP ${prop.zipCode}` : ''}
            </Option>
          ))}
        </Dropdown>
      )}
    </Wrapper>
  );
};
