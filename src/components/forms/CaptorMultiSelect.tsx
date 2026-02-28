import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { MdClose, MdArrowDropDown, MdSearch, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

interface User {
  id: string;
  name: string;
  email?: string;
}

interface CaptorMultiSelectProps {
  users: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button<{ $isOpen: boolean; $hasError?: boolean }>`
  width: 100%;
  min-height: 52px;
  padding: 10px 16px;
  background: ${props => props.theme.colors.background};
  border: 2px solid
    ${props =>
      props.$hasError
        ? props.theme.colors.error
        : props.$isOpen
          ? props.theme.colors.primary
          : props.theme.colors.border};
  border-radius: 12px;
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: all 0.2s ease;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  min-height: 24px;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: ${props => props.theme.colors.primary}18;
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary}35;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const RemoveTagBtn = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 0;
  margin-left: 2px;
  transition: color 0.2s;
  line-height: 0;

  &:hover {
    color: ${props => props.theme.colors.error};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Placeholder = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
  font-size: 1rem;
`;

const ArrowIcon = styled(MdArrowDropDown)<{ $isOpen: boolean }>`
  width: 24px;
  height: 24px;
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
  animation: ${props => props.$openUpward ? 'slideUp' : 'slideDown'} 0.15s ease;

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const SearchWrapper = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-size: 0.95rem;
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

const OptionItem = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
  background: ${props => props.$isSelected ? `${props.theme.colors.primary}12` : 'transparent'};

  &:hover {
    background: ${props =>
      props.$isSelected
        ? `${props.theme.colors.primary}20`
        : props.theme.colors.backgroundSecondary};
  }
`;

const CheckboxIcon = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.primary};
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const OptionInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const OptionName = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OptionEmail = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  font-style: italic;
`;

export const CaptorMultiSelect: React.FC<CaptorMultiSelectProps> = ({
  users,
  selectedIds,
  onChange,
  placeholder = 'Selecione os captadores',
  disabled = false,
}) => {
  const DROPDOWN_MAX_HEIGHT = 280;
  const DROPDOWN_MARGIN = 6;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
    maxHeight: number;
  }>({ top: 0, left: 0, width: 0, openUpward: false, maxHeight: DROPDOWN_MAX_HEIGHT });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Calcular posição do dropdown — abre para cima se não há espaço abaixo
  const updateDropdownPos = () => {
    if (buttonRef.current) {
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
    }
  };

  const handleOpen = () => {
    if (disabled) return;
    if (!isOpen) updateDropdownPos();
    setIsOpen(v => !v);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const dropdownEl = document.getElementById('captor-dropdown-portal');
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownEl &&
        !dropdownEl.contains(target)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    const handleScroll = () => {
      if (isOpen) updateDropdownPos();
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updateDropdownPos);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updateDropdownPos);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (id: string) => {
    if (disabled) return;
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedIds.filter(x => x !== id));
  };

  const selectedUsers = users.filter(u => selectedIds.includes(u.id));

  const dropdownContent = isOpen ? (
    <Dropdown
      id="captor-dropdown-portal"
      $top={dropdownPos.top}
      $left={dropdownPos.left}
      $width={dropdownPos.width}
      $openUpward={dropdownPos.openUpward}
      $maxHeight={dropdownPos.maxHeight}
    >
      <SearchWrapper>
        <SearchIcon />
        <SearchInput
          ref={searchRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          onClick={e => e.stopPropagation()}
        />
      </SearchWrapper>
      <OptionsList>
        {filtered.length === 0 ? (
          <EmptyMessage>Nenhum usuário encontrado</EmptyMessage>
        ) : (
          filtered.map(u => {
            const selected = selectedIds.includes(u.id);
            return (
              <OptionItem key={u.id} $isSelected={selected} onClick={() => toggle(u.id)}>
                <CheckboxIcon>
                  {selected ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                </CheckboxIcon>
                <OptionInfo>
                  <OptionName>{u.name}</OptionName>
                  {u.email && <OptionEmail>{u.email}</OptionEmail>}
                </OptionInfo>
              </OptionItem>
            );
          })
        )}
      </OptionsList>
    </Dropdown>
  ) : null;

  return (
    <Container ref={containerRef}>
      <SelectButton
        ref={buttonRef}
        type="button"
        $isOpen={isOpen}
        onClick={handleOpen}
        disabled={disabled}
      >
        <TagsWrapper>
          {selectedUsers.length > 0 ? (
            selectedUsers.map(u => (
              <Tag key={u.id}>
                {u.name}
                <RemoveTagBtn
                  role="button"
                  tabIndex={0}
                  onClick={e => removeTag(u.id, e)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') removeTag(u.id, e as unknown as React.MouseEvent); }}
                  title={`Remover ${u.name}`}
                  aria-label={`Remover ${u.name}`}
                >
                  <MdClose />
                </RemoveTagBtn>
              </Tag>
            ))
          ) : (
            <Placeholder>{placeholder}</Placeholder>
          )}
        </TagsWrapper>
        <ArrowIcon $isOpen={isOpen} />
      </SelectButton>

      {typeof document !== 'undefined' &&
        ReactDOM.createPortal(dropdownContent, document.body)}
    </Container>
  );
};
