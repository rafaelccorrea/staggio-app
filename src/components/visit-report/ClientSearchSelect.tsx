import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { api } from '../../services/api';
import type { Client } from '../../hooks/useClients';

const Wrapper = styled.div`
  position: relative;
  width: 100%;
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

/** Aguarda o usuário parar de digitar antes de buscar (evita chamadas em loop). */
const DEBOUNCE_MS = 2000;

interface ClientSearchSelectProps {
  value: string;
  displayLabel?: string;
  onSelect: (clientId: string, client?: Client) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ClientSearchSelect: React.FC<ClientSearchSelectProps> = ({
  value,
  displayLabel,
  onSelect,
  disabled,
  placeholder = 'Buscar por nome ou CPF...',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchClients = useCallback(async (term: string) => {
    if (!term.trim()) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/clients', {
        params: { search: term.trim(), limit: 25, page: 1 },
      });
      const data = res.data?.data ?? res.data ?? [];
      setItems(Array.isArray(data) ? data : []);
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
    debounceRef.current = setTimeout(() => fetchClients(query), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchClients]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (client: Client) => {
    onSelect(client.id, client);
    setQuery('');
    setOpen(false);
  };

  const showDropdown = open && (query.length >= 1 || items.length > 0);
  const inputDisplay = open ? query : (displayLabel || '');
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
          {query.trim() && loading && (
            <Option style={{ cursor: 'default' }}>Buscando...</Option>
          )}
          {query.trim() && !loading && items.length === 0 && (
            <Option style={{ cursor: 'default', color: 'var(--theme-text-secondary)' }}>
              Nenhum cliente encontrado
            </Option>
          )}
          {items.map(client => (
            <Option key={client.id} onClick={() => handleSelect(client)}>
              <strong>{client.name}</strong>
              {client.cpf && ` · CPF ${client.cpf}`}
            </Option>
          ))}
        </Dropdown>
      )}
    </Wrapper>
  );
};
