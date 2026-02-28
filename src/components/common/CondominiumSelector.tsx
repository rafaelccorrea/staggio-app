import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { MdSearch, MdClose, MdHome, MdLocationOn, MdArrowDropDown } from 'react-icons/md';
import { condominiumApi } from '../../services/condominiumApi';
import type { Condominium } from '../../types/condominium';
import { showError } from '../../utils/notifications';

interface CondominiumSelectorProps {
  value?: string;
  onChange: (condominiumId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button<{ $isOpen: boolean; $hasValue: boolean }>`
  width: 100%;
  min-height: 48px;
  padding: 10px 16px;
  background: ${props => props.theme.colors.background};
  border: 2px solid
    ${props =>
      props.$isOpen
        ? props.theme.colors.primary
        : props.theme.colors.border};
  border-radius: 12px;
  font-size: 0.938rem;
  color: ${props =>
    props.$hasValue
      ? props.theme.colors.text
      : props.theme.colors.textSecondary};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: all 0.2s ease;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary}80;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 4px ${props => props.theme.colors.primary}20;
  }
`;

const SelectValue = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  overflow: hidden;
  color: inherit;
`;

const Placeholder = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
`;

const SelectedCondominium = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  color: ${props => props.theme.colors.text};
`;

const CondominiumName = styled.span`
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${props => props.theme.colors.text};
`;

const CondominiumLocation = styled.span`
  font-size: 0.813rem;
  color: ${props => props.theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 2px;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
    color: ${props => props.theme.colors.text};
  }
`;

const ArrowIcon = styled(MdArrowDropDown)<{ $isOpen: boolean }>`
  width: 22px;
  height: 22px;
  color: ${props => props.theme.colors.textSecondary};
  transition: transform 0.2s ease;
  transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  flex-shrink: 0;
`;

const Dropdown = styled.div<{
  $top: number;
  $left: number;
  $width: number;
  $openUpward: boolean;
  $maxHeight: number;
}>`
  position: fixed;
  top: ${props => props.$top}px;
  left: ${props => props.$left}px;
  width: ${props => props.$width}px;
  max-height: ${props => props.$maxHeight}px;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${props => (props.$openUpward ? 'slideUp' : 'slideDown')} 0.15s ease;

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const SearchContainer = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const SearchIcon = styled(MdSearch)`
  width: 18px;
  height: 18px;
  color: ${props => props.theme.colors.textSecondary};
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.text};
  outline: none;

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
    font-style: italic;
  }
`;

const OptionsList = styled.div`
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.backgroundSecondary};
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: 2px;
  }
`;

const OptionItem = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  padding: 10px 12px;
  background: ${props =>
    props.$isSelected ? `${props.theme.colors.primary}12` : 'transparent'};
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${props => props.theme.colors.text};

  &:hover {
    background: ${props =>
      props.$isSelected
        ? `${props.theme.colors.primary}20`
        : props.theme.colors.backgroundSecondary};
  }
`;

const OptionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const OptionName = styled.div`
  font-weight: 500;
  font-size: 0.938rem;
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OptionLocation = styled.div`
  font-size: 0.813rem;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  font-style: italic;
`;

const LoadingState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const DROPDOWN_MAX_HEIGHT = 320;
const DROPDOWN_MARGIN = 6;

export const CondominiumSelector: React.FC<CondominiumSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecione um condomínio...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
    maxHeight: number;
  }>({ top: 0, left: 0, width: 0, openUpward: false, maxHeight: DROPDOWN_MAX_HEIGHT });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calcular posição do dropdown — abre para cima se não há espaço abaixo
  const updateDropdownPos = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_MARGIN;
    const spaceAbove = rect.top - DROPDOWN_MARGIN;
    const openUpward = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;
    const maxHeight = openUpward
      ? Math.min(DROPDOWN_MAX_HEIGHT, spaceAbove)
      : Math.min(DROPDOWN_MAX_HEIGHT, spaceBelow);

    setDropdownPos({
      top: openUpward
        ? rect.top + window.scrollY - maxHeight - DROPDOWN_MARGIN
        : rect.bottom + window.scrollY + DROPDOWN_MARGIN,
      left: rect.left + window.scrollX,
      width: rect.width,
      openUpward,
      maxHeight,
    });
  };

  // Carregar condomínios quando abrir
  useEffect(() => {
    if (!isOpen) return;
    const loadCondominiums = async () => {
      try {
        setLoading(true);
        const response = await condominiumApi.listCondominiums();
        const list = Array.isArray(response)
          ? response
          : (response as any).data ?? [];
        setCondominiums(list.filter((c: any) => c.isActive));
      } catch (error: any) {
        console.error('Erro ao carregar condomínios:', error);
        showError('Erro ao carregar condomínios');
      } finally {
        setLoading(false);
      }
    };
    loadCondominiums();
  }, [isOpen]);

  // Fechar ao clicar fora ou rolar a página
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const dropdownEl = document.getElementById('condominium-dropdown-portal');
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownEl &&
        !dropdownEl.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleScroll = () => updateDropdownPos();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updateDropdownPos);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updateDropdownPos);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const filteredCondominiums = useMemo(() => {
    if (!searchTerm) return condominiums;
    const term = searchTerm.toLowerCase();
    return condominiums.filter(
      c =>
        c.name.toLowerCase().includes(term) ||
        c.address.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.neighborhood.toLowerCase().includes(term)
    );
  }, [condominiums, searchTerm]);

  const selectedCondominium = useMemo(
    () => (value ? condominiums.find(c => c.id === value) || null : null),
    [condominiums, value]
  );

  const handleSelect = (condominiumId: string) => {
    onChange(condominiumId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) updateDropdownPos();
    setIsOpen(v => !v);
  };

  const dropdownContent = isOpen ? (
    <Dropdown
      id="condominium-dropdown-portal"
      $top={dropdownPos.top}
      $left={dropdownPos.left}
      $width={dropdownPos.width}
      $openUpward={dropdownPos.openUpward}
      $maxHeight={dropdownPos.maxHeight}
    >
      <SearchContainer>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder="Buscar condomínio..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onClick={e => e.stopPropagation()}
          autoFocus
        />
      </SearchContainer>

      <OptionsList>
        {loading ? (
          <LoadingState>Carregando condomínios...</LoadingState>
        ) : filteredCondominiums.length === 0 ? (
          <EmptyState>
            {searchTerm ? 'Nenhum condomínio encontrado' : 'Nenhum condomínio disponível'}
          </EmptyState>
        ) : (
          filteredCondominiums.map(condominium => (
            <OptionItem
              key={condominium.id}
              type="button"
              onClick={() => handleSelect(condominium.id)}
              $isSelected={condominium.id === value}
            >
              <MdHome size={20} style={{ flexShrink: 0 }} />
              <OptionInfo>
                <OptionName>{condominium.name}</OptionName>
                <OptionLocation>
                  <MdLocationOn size={13} />
                  {condominium.address}, {condominium.city} - {condominium.state}
                </OptionLocation>
              </OptionInfo>
            </OptionItem>
          ))
        )}
      </OptionsList>
    </Dropdown>
  ) : null;

  return (
    <SelectContainer ref={containerRef}>
      <SelectButton
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        $isOpen={isOpen}
        $hasValue={!!selectedCondominium}
        disabled={disabled}
      >
        <SelectValue>
          {selectedCondominium ? (
            <SelectedCondominium>
              <MdHome size={18} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <CondominiumName>{selectedCondominium.name}</CondominiumName>
                <CondominiumLocation>
                  <MdLocationOn size={13} />
                  {selectedCondominium.city}, {selectedCondominium.state}
                </CondominiumLocation>
              </div>
            </SelectedCondominium>
          ) : (
            <Placeholder>{placeholder}</Placeholder>
          )}
        </SelectValue>
        {selectedCondominium && !disabled && (
          <ClearButton onClick={handleClear} type="button" title="Remover condomínio">
            <MdClose size={18} />
          </ClearButton>
        )}
        <ArrowIcon $isOpen={isOpen} />
      </SelectButton>

      {typeof document !== 'undefined' &&
        ReactDOM.createPortal(dropdownContent, document.body)}
    </SelectContainer>
  );
};
