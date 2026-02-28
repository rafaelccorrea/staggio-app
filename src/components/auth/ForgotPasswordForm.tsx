import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import type { ForgotPasswordFormData } from '../../types/auth';
import { IoMail, IoCheckmarkCircle } from 'react-icons/io5';
import styled from 'styled-components';
import {
  LoginContainer,
  LoginCard,
  WelcomeSection,
  FormSection,
  FormWrapper,
  WelcomeContent,
  WelcomeTitle,
  WelcomeSubtitle,
  FormTitle,
  SignUpLink,
} from '../../styles/pages/AuthStyles';
import {
  SuccessContainer,
  AnimationContainer,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
} from '../../styles/pages/ForgotPasswordStyles';
import {
  EmailInputContainer,
  Label,
  Input,
} from '../../styles/pages/ForgotPasswordStyles';
import { SubmitButton } from '../forms/SubmitButton';
import { AlertMessage } from '../forms/AlertMessage';
import { getAssetPath } from '../../utils/pathUtils';

// Logo centralizada
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;

  img {
    height: 120px;
    width: auto;
    max-width: 100%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    margin-bottom: 28px;
    img {
      height: 100px;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 24px;
    img {
      height: 92px;
    }
  }

  @media (max-width: 360px) {
    img {
      height: 84px;
    }
  }
`;

const FormSubtitle = styled.p`
  color: #64748b;
  margin-bottom: 32px;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 480px) {
    margin-bottom: 24px;
    font-size: 0.9375rem;
  }
`;

// Círculo de sucesso responsivo
const SuccessCircle = styled.div`
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border-radius: 50%;
  font-size: 80px;
  color: #a63126;
  border: 1px solid #e2e8f0;

  @media (max-width: 480px) {
    width: 140px;
    height: 140px;
    font-size: 56px;
  }

  @media (max-width: 360px) {
    width: 120px;
    height: 120px;
    font-size: 48px;
  }
`;

export const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, alert, forgotPassword, clearAlert } = usePasswordReset();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: ForgotPasswordFormData = {
      email: email.trim(),
    };

    await forgotPassword(formData);
    setIsSubmitted(true);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isSubmitted && alert?.type === 'success') {
    return (
      <LoginContainer>
        <LoginCard>
          <WelcomeSection $bgImage={getAssetPath('login-bg.jpg')}>
            <WelcomeContent>
              <WelcomeTitle>Email Enviado!</WelcomeTitle>
              <WelcomeSubtitle>
                Verifique sua caixa de entrada para continuar
              </WelcomeSubtitle>
            </WelcomeContent>
          </WelcomeSection>

          <FormSection>
            <FormWrapper>
              <SuccessContainer>
                <AnimationContainer>
                  <SuccessCircle>
                    <IoMail />
                  </SuccessCircle>
                </AnimationContainer>

                <SuccessIcon>
                  <IoCheckmarkCircle size={48} />
                </SuccessIcon>

                <SuccessTitle>Email Enviado!</SuccessTitle>

                <SuccessMessage>
                  Enviamos um link de recuperação para <strong>{email}</strong>
                </SuccessMessage>

                <SuccessMessage>
                  Verifique sua caixa de entrada e siga as instruções para
                  redefinir sua senha.
                </SuccessMessage>

                <SignUpLink>
                  <button type='button' onClick={handleBackToLogin}>
                    Voltar ao Login
                  </button>
                </SignUpLink>
              </SuccessContainer>
            </FormWrapper>
          </FormSection>
        </LoginCard>
      </LoginContainer>
    );
  }

  return (
    <LoginContainer>
      <LoginCard>
        <WelcomeSection $bgImage={getAssetPath('login-bg.jpg')}>
          <WelcomeContent>
            <WelcomeTitle>Esqueceu sua senha?</WelcomeTitle>
            <WelcomeSubtitle>
              Digite seu email e enviaremos um link para redefinir sua senha
            </WelcomeSubtitle>
          </WelcomeContent>
        </WelcomeSection>

        <FormSection>
          <FormWrapper>
            <LogoContainer>
              <img src={getAssetPath('logo.png')} alt='Intellisys Logo' />
            </LogoContainer>

            <FormTitle>Recuperar Senha</FormTitle>
            <FormSubtitle>
              Enviaremos um link de recuperação para seu email
            </FormSubtitle>

            <AlertMessage
              type={alert?.type || 'info'}
              message={alert?.message || ''}
              onClose={clearAlert}
            />

            <form onSubmit={handleSubmit}>
              <EmailInputContainer>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='seu@email.com'
                  required
                  disabled={isLoading}
                />
              </EmailInputContainer>

              <SubmitButton
                isLoading={isLoading}
                loadingText='Enviando...'
                defaultText='Enviar Link de Recuperação'
                disabled={!email.trim()}
              />

              <SignUpLink>
                Lembrou da senha?{' '}
                <button type='button' onClick={handleBackToLogin}>
                  Fazer login
                </button>
              </SignUpLink>
            </form>
          </FormWrapper>
        </FormSection>
      </LoginCard>
    </LoginContainer>
  );
};
