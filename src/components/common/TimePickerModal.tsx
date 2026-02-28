import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { MdSchedule, MdClose, MdCheck } from 'react-icons/md';

export interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string; // "HH:mm" ou "HH:mm:ss"
  onConfirm: (value: string) => void; // "HH:mm" (API pode adicionar :00)
  title?: string;
  disabled?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

function parseTime(v: string): { hour: string; minute: string } {
  if (!v) return { hour: '08', minute: '00' };
  const parts = v.split(':');
  const h = Math.min(23, Math.max(0, parseInt(parts[0], 10) || 0));
  const m = Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0));
  return { hour: pad(h), minute: pad(m) };
}

export function TimePickerModal({
  isOpen,
  onClose,
  value,
  onConfirm,
  title = 'Selecionar horário',
}: TimePickerModalProps) {
  const parsed = parseTime(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);

  useEffect(() => {
    if (isOpen) {
      const p = parseTime(value);
      setHour(p.hour);
      setMinute(p.minute);
    }
  }, [isOpen, value]);

  const result = `${hour}:${minute}`;

  const handleConfirm = () => {
    onConfirm(result);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', onEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <IconWrap>
            <MdSchedule size={24} />
          </IconWrap>
          <Title>{title}</Title>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar">
            <MdClose size={22} />
          </CloseButton>
        </Header>

        <Display>{result}</Display>

        <SelectRow>
          <SelectGroup>
            <SelectLabel>Hora</SelectLabel>
            <Select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              aria-label="Hora"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
          </SelectGroup>
          <Separator>:</Separator>
          <SelectGroup>
            <SelectLabel>Minuto</SelectLabel>
            <Select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              aria-label="Minuto"
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </SelectGroup>
        </SelectRow>

        <QuickMinutes>
          {['00', '15', '30', '45'].map((m) => (
            <QuickBtn
              key={m}
              type="button"
              $active={minute === m}
              onClick={() => setMinute(m)}
            >
              :{m}
            </QuickBtn>
          ))}
        </QuickMinutes>

        <Footer>
          <FooterBtn $variant="secondary" type="button" onClick={onClose}>
            <MdClose size={18} />
            Cancelar
          </FooterBtn>
          <FooterBtn $variant="primary" type="button" onClick={handleConfirm}>
            <MdCheck size={18} />
            Confirmar
          </FooterBtn>
        </Footer>
      </Modal>
    </Overlay>,
    document.body
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  background: ${(p) => p.theme.colors.cardBackground};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: slideUp 0.25s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  position: relative;
`;

const IconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${(p) => p.theme.colors.primary}18;
  color: ${(p) => p.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: ${(p) => p.theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: ${(p) => p.theme.colors.hover};
    color: ${(p) => p.theme.colors.text};
  }
`;

const Display = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${(p) => p.theme.colors.primary};
  text-align: center;
  padding: 24px 20px 8px;
  font-variant-numeric: tabular-nums;
`;

const SelectRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px 8px;
`;

const SelectGroup = styled.div`
  flex: 1;
  max-width: 120px;
`;

const SelectLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSecondary};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 14px;
  font-size: 1.125rem;
  font-weight: 600;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  background: ${(p) => p.theme.colors.cardBackground};
  color: ${(p) => p.theme.colors.text};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(p) => p.theme.colors.primary}25;
  }
`;

const Separator = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textSecondary};
  padding-bottom: 12px;
`;

const QuickMinutes = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 12px 20px 20px;
`;

const QuickBtn = styled.button<{ $active?: boolean }>`
  padding: 8px 14px;
  border-radius: 10px;
  border: 2px solid
    ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.border)};
  background: ${(p) =>
    p.$active ? `${p.theme.colors.primary}15` : p.theme.colors.backgroundSecondary};
  color: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary)};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(p) => p.theme.colors.primary};
    color: ${(p) => p.theme.colors.primary};
    background: ${(p) => p.theme.colors.primary}10;
  }
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 20px 20px;
  border-top: 1px solid ${(p) => p.theme.colors.border};
  background: ${(p) => p.theme.colors.backgroundSecondary};
`;

const FooterBtn = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  ${(p) =>
    p.$variant === 'primary'
      ? `
    background: ${p.theme.colors.primary};
    color: white;
    border-color: ${p.theme.colors.primary};
    &:hover { background: ${p.theme.colors.primaryHover}; }
  `
      : `
    background: ${p.theme.colors.cardBackground};
    color: ${p.theme.colors.textSecondary};
    border-color: ${p.theme.colors.border};
    &:hover { background: ${p.theme.colors.hover}; color: ${p.theme.colors.text}; }
  `}
`;
