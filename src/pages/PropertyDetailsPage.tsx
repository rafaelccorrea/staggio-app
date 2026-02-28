import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  MdArrowBack,
  MdHome,
  MdAttachMoney,
  MdVpnKey,
  MdOpenInNew,
} from 'react-icons/md';
import { toast } from 'react-toastify';
import { Layout } from '../components/layout/Layout';
import { PropertyImageCarousel } from '../components/property/PropertyImageCarousel';
import { PropertyMap } from '../components/property/PropertyMap';
import { PropertyClientsManager } from '../components/property/PropertyClientsManager';
import { PropertyExpensesSection } from '../components/property/PropertyExpensesSection';
import { EntityDocumentsList } from '../components/documents/EntityDocumentsList';
import { ChecklistSection } from '../components/checklists/ChecklistSection';
import { PermissionButton } from '../components/common/PermissionButton';
import { PropertyPublicToggle } from '../components/properties/PropertyPublicToggle';
import { useMatches } from '../hooks/useMatches';
import { Spinner } from '../components/common/Spinner';
import { propertyApi } from '../services/propertyApi';
import { keyApi } from '../services/keyApi';
import { usersApi } from '../services/usersApi';
import type { Property } from '../types/property';
import { PropertyStatus as PropertyStatusEnum } from '../types/property';
import { ImageFullscreenModal } from '../components/common/ImageFullscreenModal';
import { PropertyDetailsShimmer } from '../components/shimmer/PropertyDetailsShimmer';
import { SubmitApprovalModal } from '../components/modals/SubmitApprovalModal';
import { ProposalGeneratorButton } from '../components/ai/ProposalGeneratorButton';
import { PropertyOffersModal } from '../components/modals/PropertyOffersModal';
import { useModuleAccess } from '../hooks/useModuleAccess';
import { usePropertyOffers } from '../hooks/usePropertyOffers';
import {
  PropertyDetailsContainer,
  PropertyDetailsHeader,
  PropertyDetailsHeaderContent,
  PropertyDetailsContent,
  MainContent,
  Sidebar,
  PropertyCard,
  PropertyHeader,
  PropertyTitle,
  PropertyCode,
  PropertyAddress,
  PropertyStatus,
  PropertyCharacteristics,
  CharacteristicsGrid,
  CharacteristicItem,
  CharacteristicValue,
  CharacteristicLabel,
  PropertyPrices,
  PricesGrid,
  PriceItem,
  PriceLabel,
  PriceValue,
  ActionButton,
  ImageGallery,
  PropertyMapSection,
  MapContainer,
  PropertyClientsSection,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorTitle,
  ErrorMessage,
  ErrorButton,
  BackButton,
  LocationMapGrid,
} from '../styles/pages/PropertyDetailsPageStyles';

// Sanitiza strings que contenham "[object Object]" reconstruindo o endereço
// a partir dos campos separados quando disponíveis
const formatAddress = (property: any): string => {
  const clean = (s: any) =>
    typeof s === 'string' && !s.includes('[object') ? s.trim() : '';

  const street = clean(property.street);
  const number = clean(property.number);
  const complement = clean(property.complement);

  // Se o address salvo está corrompido, reconstruir dos campos separados
  const raw = clean(property.address);
  const isCorrupted = !raw || property.address?.includes('[object');

  if (isCorrupted && (street || number)) {
    return [street, number, complement].filter(Boolean).join(', ');
  }

  // Remover qualquer "[object Object]" residual do address salvo
  return raw.replace(/,?\s*\[object Object\]/gi, '').trim();
};

// Helper to format values in BRL, accepting number or string
const formatBRL = (value?: number | string | null) => {
  if (value === null || value === undefined) return '';
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(numeric as number)) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numeric as number);
};

const PropertyDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromGallery = searchParams.get('fromGallery') === 'true';
  const { propertyId } = useParams<{ propertyId: string }>();
  const { isModuleAvailableForCompany } = useModuleAccess();
  const [property, setProperty] = useState<Property | null>(null);
  const [responsibleUser, setResponsibleUser] = useState<any>(null);
  const [keyStatus, setKeyStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSubmitApprovalModal, setShowSubmitApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState<'sale' | 'rental' | null>(
    null
  );
  const [showOffersModal, setShowOffersModal] = useState(false);

  const hasAIAssistantModule = isModuleAvailableForCompany('ai_assistant');

  // Hook para ofertas
  const { fetchPropertyOffers } = usePropertyOffers(propertyId);

  // Matches compatíveis
  const { matches = [], loading: matchesLoading } = useMatches({
    propertyId: propertyId,
    status: 'pending',
    autoFetch: !!propertyId,
  });

  const loadPropertyDetails = useCallback(async () => {
    if (!propertyId) return;

    try {
      setIsLoading(true);

      // Carregar dados da propriedade (fromGallery permite ver qualquer propriedade da empresa, vindo da galeria)
      const propertyData = await propertyApi.getPropertyById(propertyId, {
        fromGallery,
      });
      setProperty(propertyData);

      // Carregar informações do responsável se disponível
      if (propertyData.responsibleUserId) {
        try {
          const userData = await usersApi.getUserById(
            propertyData.responsibleUserId
          );
          setResponsibleUser(userData);
        } catch (error) {
          console.warn(
            'Usuário responsável não pertence à empresa, tentando buscar informações básicas:',
            error
          );
          try {
            const basicUserData = await usersApi.getUserBasicInfo(
              propertyData.responsibleUserId
            );
            setResponsibleUser(basicUserData);
          } catch (basicError) {
            console.warn(
              'Não foi possível carregar dados básicos do responsável:',
              basicError
            );
          }
        }
      }

      // Verificar status da chave
      try {
        const keysData = await keyApi.getKeysByProperty(propertyId);
        const activeKey = keysData.find(
          key => key.status === 'available' || key.status === 'in_use'
        );
        setKeyStatus(activeKey || null);
      } catch (error) {
        console.warn('Não foi possível verificar status da key:', error);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da propriedade:', error);
      toast.error('Erro ao carregar propriedade');
      navigate(fromGallery ? '/gallery' : '/properties');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, navigate, fromGallery]);

  useEffect(() => {
    if (propertyId) {
      loadPropertyDetails();
    }
  }, [propertyId, loadPropertyDetails]);

  const handleEditProperty = () => {
    if (property?.id) {
      navigate(`/properties/edit/${property.id}`);
    }
  };

  const handleImageDoubleClick = () => {
    if (property?.images && property.images.length > 0) {
      setIsImageModalOpen(true);
      setCurrentImageIndex(0);
    }
  };

  const handleDeleteProperty = async () => {
    if (!property?.id) return;

    if (window.confirm('Tem certeza?: deseja excluir esta propriedade?')) {
      try {
        await propertyApi.deleteProperty(property.id);
        toast.success('Propriedade excluída com sucesso');
        navigate('/properties');
      } catch (error) {
        console.error('Erro ao excluir propriedade:', error);
        toast.error('Erro ao excluir propriedade');
      }
    }
  };

  const handleOpenSubmitApprovalModal = (type: 'sale' | 'rental') => {
    setApprovalType(type);
    setShowSubmitApprovalModal(true);
  };

  const handleCloseSubmitApprovalModal = () => {
    setShowSubmitApprovalModal(false);
    setApprovalType(null);
  };

  const handleApprovalSubmitted = () => {
    setShowSubmitApprovalModal(false);
    setApprovalType(null);
    toast.success('Solicitação de aprovação enviada com sucesso!');
  };

  if (isLoading) {
    return (
      <Layout>
        <PropertyDetailsShimmer />
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <ErrorContainer>
          <ErrorTitle>Propriedade não encontrada</ErrorTitle>
          <ErrorMessage>
            Esta propriedade não existe ou foi removida.
          </ErrorMessage>
          <ErrorButton onClick={() => navigate(fromGallery ? '/gallery' : '/properties')}>
            {fromGallery ? 'Voltar à Galeria' : 'Voltar às Propriedades'}
          </ErrorButton>
        </ErrorContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PropertyDetailsContainer>
        <PropertyDetailsHeader>
          <PropertyDetailsHeaderContent>
            <PropertyHeader>
              <PropertyTitle>
                {property.title}
                {property.code && (
                  <PropertyCode>Código: {property.code}</PropertyCode>
                )}
              </PropertyTitle>
              <PropertyAddress>
                <MdHome />
                {formatAddress(property)}, {property.city}/{property.state}
              </PropertyAddress>
            </PropertyHeader>

            <BackButton
              onClick={() => navigate(fromGallery ? '/gallery' : '/properties')}
            >
              <MdArrowBack />
              {fromGallery ? 'Voltar à Galeria' : 'Voltar às Propriedades'}
            </BackButton>
          </PropertyDetailsHeaderContent>
        </PropertyDetailsHeader>

        <PropertyDetailsContent>
          <MainContent>
            {/* Image Gallery */}
            <PropertyCard>
              <ImageGallery>
                <h3>📸 Galeria de Imagens</h3>
                <PropertyImageCarousel
                  images={property.images || []}
                  mainImage={property.mainImage}
                  onImageDoubleClick={handleImageDoubleClick}
                />
              </ImageGallery>
            </PropertyCard>

            {/* Property Characteristics */}
            <PropertyCard>
              <PropertyCharacteristics>
                <h3>🏗️ Características da Propriedade</h3>
                <CharacteristicsGrid>
                  {property.totalArea && (
                    <CharacteristicItem>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        📐
                      </div>
                      <CharacteristicLabel>Área Total</CharacteristicLabel>
                      <CharacteristicValue>
                        {property.totalArea}m²
                      </CharacteristicValue>
                    </CharacteristicItem>
                  )}

                  {property.builtArea && property.builtArea > 0 && (
                    <CharacteristicItem>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        🏠
                      </div>
                      <CharacteristicLabel>Área Construída</CharacteristicLabel>
                      <CharacteristicValue>
                        {property.builtArea}m²
                      </CharacteristicValue>
                    </CharacteristicItem>
                  )}

                  {property.bedrooms !== undefined && property.bedrooms > 0 && (
                    <CharacteristicItem>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        🛏️
                      </div>
                      <CharacteristicLabel>Quartos</CharacteristicLabel>
                      <CharacteristicValue>
                        {property.bedrooms}
                      </CharacteristicValue>
                    </CharacteristicItem>
                  )}

                  {property.bathrooms !== undefined &&
                    property.bathrooms > 0 && (
                      <CharacteristicItem>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                          🚿
                        </div>
                        <CharacteristicLabel>Banheiros</CharacteristicLabel>
                        <CharacteristicValue>
                          {property.bathrooms}
                        </CharacteristicValue>
                      </CharacteristicItem>
                    )}

                  {property.parkingSpaces !== undefined &&
                    property.parkingSpaces > 0 && (
                      <CharacteristicItem>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                          🚗
                        </div>
                        <CharacteristicLabel>
                          Vagas de Garagem
                        </CharacteristicLabel>
                        <CharacteristicValue>
                          {property.parkingSpaces}
                        </CharacteristicValue>
                      </CharacteristicItem>
                    )}
                </CharacteristicsGrid>
              </PropertyCharacteristics>
            </PropertyCard>

            {/* Documents Section - Full Width */}
            <PropertyCard>
              <EntityDocumentsList
                entityId={propertyId!}
                entityType='property'
                entityName={property.title}
              />
            </PropertyCard>

            {/* Checklists Section - Full Width */}
            <ChecklistSection
              propertyId={propertyId}
              showCreateButton={true}
              limit={5}
            />

            {/* Expenses Section - Full Width */}
            <PropertyCard>
              <PropertyExpensesSection
                propertyId={propertyId!}
                propertyTitle={property.title}
              />
            </PropertyCard>

            {/* Clients Section - Full Width */}
            <PropertyCard>
              <PropertyClientsSection>
                <h3 style={{ marginBottom: '12px' }}>👥 Clientes Vinculados</h3>
                <PropertyClientsManager
                  propertyId={propertyId!}
                  propertyTitle={property.title}
                />
              </PropertyClientsSection>
            </PropertyCard>
          </MainContent>

          <Sidebar>
            {/* Map Section - Right Side */}
            <PropertyCard>
              <PropertyMapSection>
                <h3>🗺️ Mapa</h3>
                <MapContainer>
                  <PropertyMap
                    address={`${formatAddress(property)}, ${property.city}, ${property.state}`}
                    zipCode={property.zipCode}
                  />
                </MapContainer>
              </PropertyMapSection>
            </PropertyCard>
            {/* Action Buttons */}
            <PropertyCard>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <PermissionButton
                  permission='property:update'
                  onClick={handleEditProperty}
                  variant='primary'
                  size='medium'
                  style={{ width: '100%' }}
                >
                  ✏️ Editar Propriedade
                </PermissionButton>

                {/* Botão para ver no site - apenas se a propriedade estiver publicada */}
                {property.isAvailableForSite && (
                  <ActionButton
                    onClick={() =>
                      window.open(
                        `https://www.intellisys.com.br/imovel/${property.id}`,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                    $variant='secondary'
                    style={{ width: '100%' }}
                  >
                    <MdOpenInNew size={20} />
                    Ver no Site Intellisys
                  </ActionButton>
                )}

                {/* AI Proposal Generator - Only show if property is available and AI module is active */}
                {hasAIAssistantModule &&
                  property &&
                  property.status === PropertyStatusEnum.AVAILABLE && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <ProposalGeneratorButton
                        propertyId={property.id}
                        fullWidth
                      />
                    </div>
                  )}

                {/* Financial Submission Buttons - Only show if property is sold or rented AND no pending approval */}
                {(property.status === PropertyStatusEnum.SOLD ||
                  property.status === PropertyStatusEnum.RENTED) &&
                  !property.hasPendingFinancialApproval && (
                    <>
                      {property.status === PropertyStatusEnum.SOLD && (
                        <PermissionButton
                          permission='financial:view'
                          onClick={() => handleOpenSubmitApprovalModal('sale')}
                          variant='primary'
                          size='medium'
                          style={{
                            background:
                              'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            width: '100%',
                          }}
                        >
                          <MdAttachMoney />
                          Submeter Venda ao Financeiro
                        </PermissionButton>
                      )}

                      {property.status === PropertyStatusEnum.RENTED && (
                        <PermissionButton
                          permission='financial:view'
                          onClick={() =>
                            handleOpenSubmitApprovalModal('rental')
                          }
                          variant='primary'
                          size='medium'
                          style={{
                            background:
                              'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            width: '100%',
                          }}
                        >
                          <MdAttachMoney />
                          Submeter Aluguel ao Financeiro
                        </PermissionButton>
                      )}
                    </>
                  )}

                {/* Alert when there's a pending approval */}
                {property.hasPendingFinancialApproval && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'var(--color-warning-background)',
                      border: '1px solid var(--color-warning)',
                      color: 'var(--color-text)',
                      fontSize: '0.9rem',
                    }}
                  >
                    ⚠️ Solicitação de aprovação financeira pendente
                  </div>
                )}

                <PermissionButton
                  permission='property:delete'
                  onClick={handleDeleteProperty}
                  variant='danger'
                  size='medium'
                  style={{ width: '100%' }}
                >
                  🗑️ Excluir
                </PermissionButton>
              </div>
            </PropertyCard>

            {/* Key Status - Prominent Position */}
            <PropertyCard>
              <h3
                style={{
                  margin: '0 0 16px 0',
                  color: 'var(--color-text)',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🔑 Status da Chave
              </h3>
              {keyStatus ? (
                <div style={{ textAlign: 'center' }}>
                  <PropertyStatus $status='available'>
                    ✅ Chave Disponível
                  </PropertyStatus>
                  <p
                    style={{
                      margin: '16px 0',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Status:{' '}
                    {keyStatus.status === 'available' ? 'Disponível' : 'Em uso'}
                  </p>
                  <ActionButton
                    onClick={() => navigate(`/keys?propertyId=${property.id}`)}
                    $variant='primary'
                  >
                    🔑 Gerenciar Chaves
                  </ActionButton>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <PropertyStatus $status='unavailable'>
                    ❌ Sem Chave
                  </PropertyStatus>
                  <p
                    style={{
                      margin: '16px 0',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Chave não foi cadastrada para esta propriedade
                  </p>
                  <ActionButton
                    onClick={() =>
                      navigate(`/keys/create?propertyId=${property.id}`)
                    }
                    $variant='primary'
                  >
                    <MdVpnKey /> Criar Chave
                  </ActionButton>
                </div>
              )}
            </PropertyCard>

            {/* Property Public Toggle */}
            <PropertyCard>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 16px 0',
                    color: 'var(--color-text)',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  🌐 Disponibilidade no Site Intellisys
                </h3>
                <PropertyPublicToggle
                  propertyId={property.id}
                  initialValue={property.isAvailableForSite || false}
                  propertyStatus={property.status}
                  isActive={property.isActive}
                  imageCount={
                    property.images?.filter(
                      img => img && img.url && img.url.trim() !== ''
                    ).length || 0
                  }
                  size='medium'
                  onSuccess={() => {
                    // Atualizar apenas o campo isAvailableForSite sem recarregar tudo
                    setProperty(prev =>
                      prev
                        ? {
                            ...prev,
                            isAvailableForSite: !prev.isAvailableForSite,
                          }
                        : null
                    );
                  }}
                />
                <p
                  style={{
                    margin: '8px 0 0 0',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    lineHeight: '1.5',
                  }}
                >
                  {property.status !== PropertyStatusEnum.AVAILABLE
                    ? 'Apenas propriedades com status "Disponível" podem ser publicadas no site Intellisys.'
                    : property.isAvailableForSite
                      ? 'Esta propriedade está visível no site Intellisys.'
                      : 'Esta propriedade não está disponível no site Intellisys. Ative para torná-la visível.'}
                </p>
              </div>
            </PropertyCard>

            {/* Property Info Panel - Values */}
            <PropertyCard>
              <PropertyPrices>
                <h3>💰 Valores</h3>
                <PricesGrid>
                  {/* Sale Price */}
                  {property.salePrice && Number(property.salePrice) > 0 && (
                    <PriceItem>
                      <PriceLabel>Preço de Venda</PriceLabel>
                      <PriceValue>{formatBRL(property.salePrice)}</PriceValue>
                    </PriceItem>
                  )}

                  {/* Rent Price */}
                  {property.rentPrice && Number(property.rentPrice) > 0 && (
                    <PriceItem>
                      <PriceLabel>Preço do Aluguel</PriceLabel>
                      <PriceValue>{formatBRL(property.rentPrice)}</PriceValue>
                    </PriceItem>
                  )}

                  {/* Additional Costs */}
                  {property.condominiumFee &&
                    Number(property.condominiumFee) > 0 && (
                      <PriceItem>
                        <PriceLabel>Condomínio</PriceLabel>
                        <PriceValue>
                          {formatBRL(property.condominiumFee)}
                        </PriceValue>
                      </PriceItem>
                    )}

                  {property.iptu && Number(property.iptu) > 0 && (
                    <PriceItem>
                      <PriceLabel>IPTU</PriceLabel>
                      <PriceValue>{formatBRL(property.iptu)}</PriceValue>
                    </PriceItem>
                  )}
                </PricesGrid>
              </PropertyPrices>
            </PropertyCard>

            {/* Informações do Proprietário */}
            {(() => {
              // Verificar se há dados do proprietário (pode vir em property.owner ou diretamente na propriedade)
              const ownerName =
                property.owner?.name || (property as any).ownerName;
              const ownerEmail =
                property.owner?.email || (property as any).ownerEmail;
              const ownerPhone =
                property.owner?.phone || (property as any).ownerPhone;
              const ownerDocument =
                property.owner?.document || (property as any).ownerDocument;
              const ownerAddress =
                property.owner?.address || (property as any).ownerAddress;

              // Mostrar seção se houver pelo menos um campo preenchido
              const hasOwnerData =
                ownerName ||
                ownerEmail ||
                ownerPhone ||
                ownerDocument ||
                ownerAddress;

              // Sempre mostrar a seção, mesmo se não houver dados (para indicar que pode ser preenchida)
              // Mas só mostrar conteúdo se houver dados

              return (
                <PropertyCard
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 16px 0',
                      color: 'var(--color-text)',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    👤 Informações do Proprietário
                  </h3>
                  {!hasOwnerData ? (
                    <div
                      style={{
                        padding: '16px',
                        background: 'var(--color-background-secondary)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.9rem',
                      }}
                    >
                      Nenhuma informação do proprietário cadastrada.
                      <br />
                      <span
                        style={{
                          fontSize: '0.8rem',
                          marginTop: '8px',
                          display: 'block',
                        }}
                      >
                        Edite a propriedade para adicionar os dados do
                        proprietário.
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {ownerName && (
                        <div
                          style={{
                            padding: '12px',
                            background: 'var(--color-background-secondary)',
                            borderRadius: '8px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-secondary)',
                              marginBottom: '4px',
                              fontWeight: '500',
                            }}
                          >
                            Nome
                          </div>
                          <div
                            style={{
                              fontWeight: '600',
                              color: 'var(--color-text)',
                            }}
                          >
                            {ownerName}
                          </div>
                        </div>
                      )}

                      {ownerEmail && (
                        <div
                          style={{
                            padding: '12px',
                            background: 'var(--color-background-secondary)',
                            borderRadius: '8px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-secondary)',
                              marginBottom: '4px',
                              fontWeight: '500',
                            }}
                          >
                            Email
                          </div>
                          <div
                            style={{
                              fontWeight: '600',
                              color: 'var(--color-text)',
                            }}
                          >
                            <a
                              href={`mailto:${ownerEmail}`}
                              style={{
                                color: 'var(--color-primary)',
                                textDecoration: 'none',
                              }}
                            >
                              {ownerEmail}
                            </a>
                          </div>
                        </div>
                      )}

                      {ownerPhone && (
                        <div
                          style={{
                            padding: '12px',
                            background: 'var(--color-background-secondary)',
                            borderRadius: '8px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-secondary)',
                              marginBottom: '4px',
                              fontWeight: '500',
                            }}
                          >
                            Telefone
                          </div>
                          <div
                            style={{
                              fontWeight: '600',
                              color: 'var(--color-text)',
                            }}
                          >
                            <a
                              href={`tel:${ownerPhone.replace(/\D/g, '')}`}
                              style={{
                                color: 'var(--color-primary)',
                                textDecoration: 'none',
                              }}
                            >
                              {ownerPhone}
                            </a>
                          </div>
                        </div>
                      )}

                      {ownerDocument && (
                        <div
                          style={{
                            padding: '12px',
                            background: 'var(--color-background-secondary)',
                            borderRadius: '8px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-secondary)',
                              marginBottom: '4px',
                              fontWeight: '500',
                            }}
                          >
                            CPF/CNPJ
                          </div>
                          <div
                            style={{
                              fontWeight: '600',
                              color: 'var(--color-text)',
                            }}
                          >
                            {ownerDocument}
                          </div>
                        </div>
                      )}

                      {ownerAddress && (
                        <div
                          style={{
                            padding: '12px',
                            background: 'var(--color-background-secondary)',
                            borderRadius: '8px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-secondary)',
                              marginBottom: '4px',
                              fontWeight: '500',
                            }}
                          >
                            Endereço
                          </div>
                          <div
                            style={{
                              fontWeight: '600',
                              color: 'var(--color-text)',
                            }}
                          >
                            {ownerAddress}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </PropertyCard>
              );
            })()}

            {/* Responsible User */}
            {responsibleUser && (
              <PropertyCard
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '200px',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 16px 0',
                    color: 'var(--color-text)',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  👤 Responsável
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'var(--color-background-secondary)',
                    borderRadius: '12px',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                    }}
                  >
                    {responsibleUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {responsibleUser.name || 'Nome não informado'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {responsibleUser.email || 'Email não informado'}
                    </div>
                  </div>
                </div>
              </PropertyCard>
            )}

            {/* Clientes Compatíveis (Matches) */}
            {matches.length > 0 && (
              <PropertyCard>
                <PropertyClientsSection>
                  <h3>🎯 Clientes Compatíveis ({matches.length})</h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      marginBottom: '16px',
                    }}
                  >
                    Clientes com perfil compatível para este imóvel
                  </p>

                  {matchesLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Spinner size={30} />
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {matches.map(match => (
                        <div
                          key={match.id}
                          style={{
                            padding: '12px',
                            background: 'var(--card-background)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onClick={() => navigate(`/clients/${match.clientId}`)}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.borderColor =
                              'var(--primary)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginBottom: '8px',
                            }}
                          >
                            <div
                              style={{
                                background:
                                  match.matchScore >= 90
                                    ? '#10b981'
                                    : match.matchScore >= 80
                                      ? '#34d399'
                                      : match.matchScore >= 70
                                        ? '#fbbf24'
                                        : '#fb923c',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '14px',
                              }}
                            >
                              {match.matchScore}%
                            </div>
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: '15px',
                                  color: 'var(--text)',
                                }}
                              >
                                {match.client?.name}
                              </div>
                              <div
                                style={{
                                  fontSize: '13px',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {match.client?.email}
                              </div>
                            </div>
                            <div
                              style={{
                                color: 'var(--primary)',
                                fontSize: '12px',
                                fontWeight: 600,
                              }}
                            >
                              Ver Cliente →
                            </div>
                          </div>
                          {match.matchDetails?.reasons &&
                            match.matchDetails.reasons.length > 0 && (
                              <div
                                style={{
                                  fontSize: '12px',
                                  color: 'var(--text-secondary)',
                                  paddingLeft: '8px',
                                }}
                              >
                                {match.matchDetails.reasons
                                  .slice(0, 2)
                                  .join(' • ')}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </PropertyClientsSection>
              </PropertyCard>
            )}

            {/* Ofertas Section - Only if accepts negotiation */}
            {property.acceptsNegotiation && (
              <PropertyCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 8px 0',
                      color: 'var(--color-text)',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    💬 Ofertas Recebidas
                  </h3>

                  {/* Estatísticas */}
                  {(property.totalOffersCount !== undefined &&
                    property.totalOffersCount > 0) ||
                  (property.offers && property.offers.length > 0) ? (
                    <>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '12px',
                          marginBottom: '12px',
                        }}
                      >
                        <div
                          style={{
                            padding: '12px',
                            background: property.hasPendingOffers
                              ? '#FEF3C7'
                              : 'var(--color-background-secondary)',
                            border: `1px solid ${property.hasPendingOffers ? '#FCD34D' : 'var(--color-border)'}`,
                            borderRadius: '8px',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: property.hasPendingOffers
                                ? '#92400E'
                                : 'var(--color-text)',
                              marginBottom: '4px',
                            }}
                          >
                            {property.totalOffersCount ??
                              property.offers?.length ??
                              0}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-secondary)',
                              fontWeight: '500',
                            }}
                          >
                            Total
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '12px',
                            background: property.hasPendingOffers
                              ? '#FEF3C7'
                              : 'var(--color-background-secondary)',
                            border: `1px solid ${property.hasPendingOffers ? '#FCD34D' : 'var(--color-border)'}`,
                            borderRadius: '8px',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: property.hasPendingOffers
                                ? '#92400E'
                                : 'var(--color-text)',
                              marginBottom: '4px',
                            }}
                          >
                            {property.pendingOffersCount ??
                              property.offers?.filter(
                                o => o.status === 'pending'
                              ).length ??
                              0}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-secondary)',
                              fontWeight: '500',
                            }}
                          >
                            Pendentes
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '12px',
                            background: 'var(--color-background-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '1.25rem',
                              fontWeight: '700',
                              color: '#10B981',
                              marginBottom: '4px',
                            }}
                          >
                            {property.acceptedOffersCount ??
                              property.offers?.filter(
                                o => o.status === 'accepted'
                              ).length ??
                              0}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-secondary)',
                              fontWeight: '500',
                            }}
                          >
                            Aceitas
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '12px',
                            background: 'var(--color-background-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '1.25rem',
                              fontWeight: '700',
                              color: '#EF4444',
                              marginBottom: '4px',
                            }}
                          >
                            {property.rejectedOffersCount ??
                              property.offers?.filter(
                                o => o.status === 'rejected'
                              ).length ??
                              0}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-text-secondary)',
                              fontWeight: '500',
                            }}
                          >
                            Rejeitadas
                          </div>
                        </div>
                      </div>

                      <ActionButton
                        onClick={() => {
                          setShowOffersModal(true);
                          if (propertyId) {
                            fetchPropertyOffers(propertyId);
                          }
                        }}
                        $variant='primary'
                        style={{ width: '100%' }}
                      >
                        💬 Ver Ofertas desta Propriedade
                        {property.hasPendingOffers && (
                          <span
                            style={{
                              marginLeft: '8px',
                              background: 'white',
                              color: '#92400E',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: '600',
                            }}
                          >
                            {property.pendingOffersCount ?? 0}
                          </span>
                        )}
                      </ActionButton>

                      {/* Botão para ver todas as ofertas da empresa */}
                      <ActionButton
                        onClick={() => navigate('/properties/offers')}
                        $variant='secondary'
                        style={{ width: '100%', marginTop: '8px' }}
                      >
                        📋 Ver Todas as Ofertas da Empresa
                      </ActionButton>
                    </>
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                        💬
                      </div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          marginBottom: '8px',
                          fontWeight: '500',
                        }}
                      >
                        Nenhuma oferta recebida
                      </div>
                      <div style={{ fontSize: '0.8rem' }}>
                        Esta propriedade ainda não recebeu ofertas.
                      </div>
                    </div>
                  )}
                </div>
              </PropertyCard>
            )}
          </Sidebar>
        </PropertyDetailsContent>

        {/* Responsive Mobile Layout */}
        <style>{`
              @media (max-width: 1024px) {
                .property-details-grid {
                  grid-template-columns: 1fr !important;
                }
                
                .property-details-header-content {
                  flex-direction: column !important;
                  gap: 16px !important;
                }
                
                .property-details-actions {
                  flex-direction: column !important;
                  width: 100% !important;
                  gap: 12px !important;
                }
                
                .property-details-actions button {
                  width: 100% !important;
                  justify-content: center !important;
                }
              }
              
              @media (max-width: 768px) {
                .property-details-header h1 {
                  font-size: 24px !important;
                }
                
                .property-details-header p {
                  font-size: 14px !important;
                }
              }
            `}</style>

        {/* Image Fullscreen Modal */}
        {property.images && property.images.length > 0 && (
          <ImageFullscreenModal
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            images={property.images}
            currentImageIndex={currentImageIndex}
            onImageChange={setCurrentImageIndex}
          />
        )}

        {/* Submit Approval Modal */}
        {approvalType && property && (
          <SubmitApprovalModal
            isOpen={showSubmitApprovalModal}
            onClose={handleCloseSubmitApprovalModal}
            onSubmitted={handleApprovalSubmitted}
            propertyId={property.id}
            propertyTitle={property.title}
            type={approvalType}
          />
        )}

        {/* Property Offers Modal */}
        <PropertyOffersModal
          isOpen={showOffersModal}
          onClose={() => {
            setShowOffersModal(false);
            // Recarregar detalhes da propriedade para atualizar contadores
            if (propertyId) {
              loadPropertyDetails();
            }
          }}
          property={property}
        />
      </PropertyDetailsContainer>
    </Layout>
  );
};

export default PropertyDetailsPage;
