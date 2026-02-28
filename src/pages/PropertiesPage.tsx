import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAdd,
  MdFilterList,
  MdAutoAwesome,
  MdSearch,
  MdComment,
  MdFileUpload,
} from 'react-icons/md';
import { Layout } from '../components/layout/Layout';
import { PropertyFiltersDrawer } from '../components/properties/PropertyFiltersDrawer';
import { IntelligentSearchModal } from '../components/properties/IntelligentSearchModal';
import { PropertyPublicToggle } from '../components/properties/PropertyPublicToggle';
import { PropertyActiveToggle } from '../components/properties/PropertyActiveToggle';
import { useProperties } from '../hooks/useProperties';
import { useIntelligentPropertySearch } from '../hooks/useIntelligentPropertySearch';
import { PredictiveAnalysisModal } from '../components/ai/PredictiveAnalysisModal';
import { usePredictiveSales } from '../hooks/usePredictiveSales';
import { useModuleAccess } from '../hooks/useModuleAccess';
import type { PropertyFilters, Property } from '../types/property';
import { PropertyStatus as PropertyStatusEnum } from '../types/property';
import { PermissionButton } from '../components/common/PermissionButton';
import { Tooltip } from '../components/ui/Tooltip';
import { DraggableContainer } from '../components/common/DraggableContainer';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { PropertyOffersModal } from '../components/modals/PropertyOffersModal';
import { toast } from 'react-toastify';
import { propertyApi } from '../services/propertyApi';
import { usePermissionsContextOptional } from '../contexts/PermissionsContext';
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageTitleContainer,
  PageTitle,
  PageSubtitle,
  HeaderActions,
  OptimizationButton,
  ActionsBar,
  LeftActions,
  SearchContainer,
  SearchInput,
  SearchIcon,
  FilterToggle,
  IntelligentSearchButton,
  EmptyState,
  EmptyStateCard,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
  EmptyStateSecondaryAction,
  PaginationWrapper,
  PaginationButton,
} from '../styles/pages/PropertiesPageStyles';
import {
  MdLocationOn,
  MdBed,
  MdBathroom,
  MdSquareFoot,
  MdVisibility,
  MdPerson,
  MdEdit,
  MdDelete,
  MdApartment,
  MdVilla,
  MdBusiness,
  MdStore,
  MdWarehouse,
  MdLandscape,
  MdHomeWork,
  MdDirectionsCar,
  MdCheckCircle,
  MdHome,
  MdPublic,
  MdLock,
} from 'react-icons/md';
import {
  PropertiesListContainer,
  ListHeader,
  PropertyRow,
  PropertyInfo,
  PropertyImagesStack,
  PropertyImage,
  ImageCount,
  PropertyDetails as ListPropertyDetails,
  PropertyTitle as ListPropertyTitle,
  PropertyCode as ListPropertyCode,
  PropertyLocation as ListPropertyLocation,
  PropertyPrice as ListPropertyPrice,
  PropertyType,
  PropertySpecs,
  PropertySpec,
  RowActions,
  MobileHidden,
  TabletHidden,
  MobileOnly,
  MobilePropertyDetails,
  MobileDetailRow,
  MobileDetailLabel,
  MobileDetailValue,
  ActionsMenuButton,
  ActionsMenu,
  ActionsMenuItem,
  ShimmerRow,
  ShimmerBox,
} from './styles/PropertiesListView.styles';

const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    properties,
    error,
    deleteProperty,
    getProperties,
    isLoading,
    updateProperty,
    total: totalFromApi,
    totalPages: totalPagesFromApi,
    currentPage: currentPageFromApi,
  } = useProperties();

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(
    null
  );
  const [openActionsMenuId, setOpenActionsMenuId] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateKeyCard, setShowCreateKeyCard] = useState(false);
  const [selectedPropertyForKey, setSelectedPropertyForKey] = useState<
    string | null
  >(null);
  const [showIntelligentSearch, setShowIntelligentSearch] = useState(false);
  const [showMarkAsSoldModal, setShowMarkAsSoldModal] = useState(false);
  const [showMarkAsRentedModal, setShowMarkAsRentedModal] = useState(false);
  const [propertyToMarkSold, setPropertyToMarkSold] = useState<Property | null>(
    null
  );
  const [propertyToMarkRented, setPropertyToMarkRented] =
    useState<Property | null>(null);
  const [isMarkingSold, setIsMarkingSold] = useState(false);
  const [isMarkingRented, setIsMarkingRented] = useState(false);
  const [showPredictiveModal, setShowPredictiveModal] = useState(false);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<any>(null);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [selectedPropertyForOffers, setSelectedPropertyForOffers] =
    useState<Property | null>(null);

  // Hook para verificar permissões (desabilitar botões quando não tiver permissão)
  const permissionsContext = usePermissionsContextOptional();
  const permissionsLoading = permissionsContext?.isLoading ?? true;
  const hasPropertyView =
    !permissionsLoading &&
    (permissionsContext?.hasPermission('property:view') ?? false);
  const hasPropertyCreate =
    !permissionsLoading &&
    (permissionsContext?.hasPermission('property:create') ?? false);
  const hasPropertyUpdate =
    !permissionsLoading &&
    (permissionsContext?.hasPermission('property:update') ?? false);
  const hasPropertyDelete =
    !permissionsLoading &&
    (permissionsContext?.hasPermission('property:delete') ?? false);
  const hasCondominiumView =
    !permissionsLoading &&
    (permissionsContext?.hasPermission('condominium:view') ?? false);
  const hasCondominiumCreate =
    !permissionsLoading &&
    (permissionsContext?.hasPermission('condominium:create') ?? false);
  const hasCondominiumPermission = hasCondominiumView || hasCondominiumCreate;
  const canDoAnyPropertyAction =
    hasPropertyView || hasPropertyUpdate || hasPropertyDelete;

  // AI Assistant (depois de todos os useState)
  const { isModuleAvailableForCompany } = useModuleAccess();
  const hasAIAssistantModule = isModuleAvailableForCompany('ai_assistant');
  const {
    predict,
    loading: predictiveLoading,
    error: predictiveError,
  } = usePredictiveSales();

  // Hook para busca inteligente
  const {
    search: intelligentSearch,
    results: intelligentResults,
    stats: intelligentStats,
    isLoading: intelligentSearchLoading,
    clearResults: clearIntelligentSearch,
  } = useIntelligentPropertySearch();

  const itemsPerPage = 12;

  // Filtros combinados (drawer + busca do header) para enviar à API
  const getCombinedFilters = useCallback(
    (overrideFilters?: PropertyFilters, overrideSearch?: string): PropertyFilters => {
      const f = overrideFilters ?? filters;
      const search = overrideSearch !== undefined ? overrideSearch : searchTerm;
      const searchVal = (search ?? '').trim() || (f.search ?? '') || undefined;
      return { ...f, search: searchVal };
    },
    [filters, searchTerm]
  );

  // Carregar primeira página ao montar (com filtros e paginação via API)
  useEffect(() => {
    getProperties(getCombinedFilters(), { page: 1, limit: itemsPerPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch quando o termo de busca do header mudar (debounce), sem rodar no mount
  const searchTermInitialized = React.useRef(false);
  useEffect(() => {
    if (!searchTermInitialized.current) {
      searchTermInitialized.current = true;
      return;
    }
    const t = setTimeout(() => {
      getProperties(getCombinedFilters(), { page: 1, limit: itemsPerPage });
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Listener para mostrar card de criar chave na lista
  useEffect(() => {
    const handleShowCreateKeyCard = (event: CustomEvent) => {
      const { propertyId } = event.detail;
      setSelectedPropertyForKey(propertyId);
      setShowCreateKeyCard(true);
    };

    window.addEventListener(
      'showCreateKeyCard',
      handleShowCreateKeyCard as EventListener
    );

    return () => {
      window.removeEventListener(
        'showCreateKeyCard',
        handleShowCreateKeyCard as EventListener
      );
    };
  }, []);

  // Efeito para exibir notificações quando houver resultados de busca inteligente
  useEffect(() => {
    if (intelligentStats && !intelligentSearchLoading) {
      if (intelligentStats.totalFound === 0) {
        toast.warning('Nenhuma propriedade encontrada para este cliente');
      } else {
        toast.success(
          `Busca concluída! ${intelligentStats.totalFound} propriedade(s) encontrada(s)`
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intelligentStats?.totalFound, intelligentSearchLoading]);

  // Função helper para atualizar apenas o estado local da propriedade sem recarregar tudo
  // O hook usePropertyPublicFlag já faz a atualização na API e atualiza seu próprio estado
  // Aqui fazemos uma atualização otimista apenas do campo isAvailableForSite na lista local
  const handlePropertyPublicToggleSuccess = useCallback(
    (propertyId: string, newValue: boolean) => {
      // Não fazer nada aqui - o componente PropertyPublicToggle já gerencia seu próprio estado
      // e a atualização visual já foi feita pelo hook usePropertyPublicFlag
      // Não chamar updateProperty para evitar refresh desnecessário da página
      // A atualização na API já foi feita pelo hook usePropertyPublicFlag
    },
    []
  );

  // Função auxiliar para verificar se pode publicar
  const canPublishProperty = useCallback(
    (property: Property): { canPublish: boolean; reason?: string } => {
      if (!property.isActive) {
        return { canPublish: false, reason: 'Propriedade deve estar ativa' };
      }
      if (property.status !== PropertyStatusEnum.AVAILABLE) {
        return { canPublish: false, reason: 'Status deve ser "Disponível"' };
      }
      const validImages =
        property.images?.filter(
          img => img && img.url && img.url.trim() !== ''
        ) || [];
      if (validImages.length < 5) {
        return {
          canPublish: false,
          reason: `Necessário ter 5 imagens (atualmente: ${validImages.length})`,
        };
      }
      return { canPublish: true };
    },
    []
  );

  // Função para alternar visibilidade no site
  const handleTogglePublicSite = useCallback(
    async (property: Property) => {
      // Validar se está tentando ativar publicação
      const newValue = !property.isAvailableForSite;
      if (newValue) {
        const validation = canPublishProperty(property);
        if (!validation.canPublish) {
          // Não mostrar toast, apenas retornar (o botão já está desabilitado)
          return;
        }
      }

      try {
        // Atualizar na API e obter a propriedade atualizada
        const updatedProperty = await propertyApi.updateProperty(property.id, {
          isAvailableForSite: newValue,
        });

        // Atualizar estado local apenas com o campo isAvailableForSite
        // Não recarregar toda a lista para evitar refresh da página
        updateProperty(property.id, {
          isAvailableForSite: newValue,
        }).catch(() => {
          // Silenciar erro - a atualização visual já foi feita
        });

        if (newValue) {
          toast.success(
            '✅ Propriedade adicionada ao site Intellisys com sucesso!'
          );
        } else {
          toast.info('🔒 Propriedade removida do site Intellisys.');
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Erro ao atualizar propriedade';

        // Verificar se é erro de plano Basic
        if (err.response?.status === 403) {
          const message = errorMessage.toLowerCase();
          if (message.includes('seu plano não permite')) {
            toast.error(
              'Seu plano não permite disponibilizar propriedades no site Intellisys.'
            );
          } else if (message.includes('limite de propriedades públicas')) {
            toast.error('Limite de propriedades no site Intellisys atingido.');
          } else {
            toast.error(errorMessage);
          }
        } else {
          toast.error(errorMessage);
        }
      }
    },
    [updateProperty, canPublishProperty]
  );

  // Carregamento de propriedades agora é feito automaticamente pelo hook useProperties
  // Não precisamos mais carregar manualmente aqui para evitar loops infinitos

  // Usar resultados da busca inteligente se tiver resultados, caso contrário usar propriedades normais
  const hasIntelligentResults =
    intelligentResults && intelligentResults.length > 0;
  const propertiesToUse = hasIntelligentResults
    ? intelligentResults.map(result => {
        // Converter o array de imagens para o formato esperado
        const property = { ...result.property };
        if (
          property.images &&
          Array.isArray(property.images) &&
          property.images.length > 0
        ) {
          // Encontrar a imagem principal ou usar a primeira
          const mainImg =
            property.images.find((img: any) => img.isMain) ||
            property.images[0];
          if (mainImg) {
            property.mainImage = {
              id: mainImg.id,
              url: mainImg.url,
            };
            property.imageCount = property.images.length;
          }
        }
        return property;
      })
    : properties;

  // Com filtros/paginação via API: usar lista do hook. Com busca inteligente: usar resultados e paginar no cliente.
  const filteredProperties = hasIntelligentResults
    ? propertiesToUse
    : properties;

  const totalPages = hasIntelligentResults
    ? Math.ceil(filteredProperties.length / itemsPerPage)
    : Math.max(1, totalPagesFromApi ?? 1);
  const effectivePage = hasIntelligentResults
    ? currentPage
    : currentPageFromApi ?? 1;
  const startIndex = (effectivePage - 1) * itemsPerPage;
  const paginatedProperties = hasIntelligentResults
    ? filteredProperties.slice(startIndex, startIndex + itemsPerPage)
    : filteredProperties;

  // Contar filtros ativos
  const activeFiltersCount = Object.values(filters).filter(
    value => value !== '' && value !== null && value !== undefined
  ).length;

  const handleDeleteProperty = (property: Property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProperty(propertyToDelete.id);
      toast.success('Propriedade excluída com sucesso!');
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir propriedade:', error);
      toast.error('Erro ao excluir propriedade');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShowDetails = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

  const handleOpenMarkAsSoldModal = (property: Property) => {
    setPropertyToMarkSold(property);
    setShowMarkAsSoldModal(true);
  };

  const confirmMarkAsSold = async () => {
    if (!propertyToMarkSold) return;

    setIsMarkingSold(true);
    try {
      // Se a propriedade estiver no site, remover primeiro
      if (propertyToMarkSold.isAvailableForSite) {
        await propertyApi.updateProperty(propertyToMarkSold.id, {
          isAvailableForSite: false,
        });
      }

      await propertyApi.markAsSold(propertyToMarkSold.id, 'Venda realizada');
      toast.success(
        'Propriedade marcada como vendida e removida do site Intellisys!'
      );
      setShowMarkAsSoldModal(false);
        setPropertyToMarkSold(null);
        await getProperties(getCombinedFilters(), {
          page: effectivePage,
          limit: itemsPerPage,
        });
    } catch (error: any) {
      console.error('Erro ao marcar como vendida:', error);
      toast.error(error.message || 'Erro ao marcar propriedade como vendida');
    } finally {
      setIsMarkingSold(false);
    }
  };

  const handleOpenMarkAsRentedModal = (property: Property) => {
    setPropertyToMarkRented(property);
    setShowMarkAsRentedModal(true);
  };

  const confirmMarkAsRented = async () => {
    if (!propertyToMarkRented) return;

    setIsMarkingRented(true);
    try {
      // Se a propriedade estiver no site, remover primeiro
      if (propertyToMarkRented.isAvailableForSite) {
        await propertyApi.updateProperty(propertyToMarkRented.id, {
          isAvailableForSite: false,
        });
      }

      await propertyApi.markAsRented(
        propertyToMarkRented.id,
        'Aluguel realizado'
      );
      toast.success(
        'Propriedade marcada como alugada e removida do site Intellisys!'
      );
      setShowMarkAsRentedModal(false);
        setPropertyToMarkRented(null);
        await getProperties(getCombinedFilters(), {
          page: effectivePage,
          limit: itemsPerPage,
        });
    } catch (error: any) {
      console.error('Erro ao marcar como alugada:', error);
      toast.error(error.message || 'Erro ao marcar propriedade como alugada');
    } finally {
      setIsMarkingRented(false);
    }
  };

  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // Buscar na API com os novos filtros para que os resultados reflitam os filtros
    getProperties(getCombinedFilters(newFilters, searchTerm), {
      page: 1,
      limit: itemsPerPage,
    });
  };

  // Usar dados de monitoramento se disponíveis (temporariamente desabilitado)
  // useEffect(() => {
  //   if (monitoringData) {
  //     // Aqui você pode atualizar a lista de propriedades com dados em tempo real
  //   }
  // }, [monitoringData]);

  // Broadcast de atualizações quando propriedades são modificadas (temporariamente desabilitado)
  // useEffect(() => {
  //   if (properties.length > 0) {
  //     broadcastUpdate({
  //       count: properties.length,
  //       lastUpdate: new Date().toISOString()
  //     }, 'update');
  //   }
  // }, [properties, broadcastUpdate]);

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return 'Preço não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Função para determinar ícone e cor baseado no tipo de propriedade
  const getPropertyTypeIcon = (type: string) => {
    const typeMap: Record<
      string,
      { icon: React.ComponentType<any>; color: string; label: string }
    > = {
      house: { icon: MdHome, color: '#10B981', label: 'Casa' },
      apartment: { icon: MdApartment, color: '#3B82F6', label: 'Apartamento' },
      penthouse: { icon: MdVilla, color: '#8B5CF6', label: 'Cobertura' },
      commercial: { icon: MdBusiness, color: '#F59E0B', label: 'Comercial' },
      store: { icon: MdStore, color: '#EC4899', label: 'Loja' },
      warehouse: { icon: MdWarehouse, color: '#6B7280', label: 'Galpão' },
      land: { icon: MdLandscape, color: '#84CC16', label: 'Terreno' },
      rural: { icon: MdHomeWork, color: '#059669', label: 'Rural' },
    };

    return (
      typeMap[type] || { icon: MdHome, color: '#6B7280', label: 'Residência' }
    );
  };

  // Função inteligente para determinar tipo de transação e preço
  const getPropertyPricing = (property: Property) => {
    const rentPrice = property.rentPrice ?? 0;
    const salePrice = property.salePrice ?? 0;
    const hasRentPrice = rentPrice > 0;
    const hasSalePrice = salePrice > 0;

    // PRIMEIRO: Verificar o status atual da propriedade
    if (property.status === 'rented') {
      // Se está ALUGADA, mostrar preço do aluguel
      if (hasRentPrice) {
        return {
          type: 'rented',
          display: 'Alugado',
          price: rentPrice,
          priceFormatted: `${formatPrice(rentPrice)}/mês`,
          color: '#059669', // verde
          status: property.status,
        };
      } else {
        return {
          type: 'rented',
          display: 'Alugado',
          price: null,
          priceFormatted: 'Preço não informado',
          color: '#059669',
          status: property.status,
        };
      }
    }

    if (property.status === 'sold') {
      // Se está VENDIDA, mostrar preço da venda
      if (hasSalePrice) {
        return {
          type: 'sold',
          display: 'Vendido',
          price: salePrice,
          priceFormatted: formatPrice(salePrice),
          color: '#DC2626', // vermelho
          status: property.status,
        };
      } else {
        return {
          type: 'sold',
          display: 'Vendido',
          price: null,
          priceFormatted: 'Preço não informado',
          color: '#DC2626',
          status: property.status,
        };
      }
    }

    // SEGUNDO: Se não tem status específico, determinar baseado nos preços disponíveis
    if (hasRentPrice && hasSalePrice) {
      // Se tem ambos, priorizar aluguel se for mais relevante
      const rentToSaleRatio = rentPrice / salePrice;

      if (rentToSaleRatio > 0.01) {
        // Aluguel representa mais de 1% do valor de venda
        return {
          type: 'rent',
          display: 'Aluguel',
          price: rentPrice,
          priceFormatted: `${formatPrice(rentPrice)}/mês`,
          color: '#3B82F6', // azul
          status: property.status,
        };
      } else {
        return {
          type: 'sale',
          display: 'Venda',
          price: salePrice,
          priceFormatted: formatPrice(salePrice),
          color: '#8B5CF6', // roxo
          status: property.status,
        };
      }
    }

    // Se tem apenas aluguel
    if (hasRentPrice) {
      return {
        type: 'rent',
        display: 'Aluguel',
        price: rentPrice,
        priceFormatted: `${formatPrice(rentPrice)}/mês`,
        color: '#3B82F6',
        status: property.status,
      };
    }

    // Se tem apenas venda
    if (hasSalePrice) {
      return {
        type: 'sale',
        display: 'Venda',
        price: salePrice,
        priceFormatted: formatPrice(salePrice),
        color: '#8B5CF6',
        status: property.status,
      };
    }

    // Se não tem nenhum preço
    return {
      type: 'available',
      display: 'Disponível',
      price: null,
      priceFormatted: 'Preço não informado',
      color: '#6B7280', // cinza
      status: property.status,
    };
  };

  const renderPropertyRow = (property: Property) => {
    const images = property.images || [];
    const maxImagesToShow = 3;
    const imagesToDisplay = images.slice(0, maxImagesToShow);
    const pricing = getPropertyPricing(property);

    return (
      <PropertyRow key={property.id}>
        <PropertyInfo>
          <PropertyImagesStack>
            {imagesToDisplay.length > 0 ? (
              <>
                {imagesToDisplay.map((image, index) => (
                  <PropertyImage
                    key={image.id || index}
                    $imageUrl={image.url || image.thumbnailUrl}
                    $index={index}
                    $total={imagesToDisplay.length}
                  />
                ))}
                {images.length > 1 && <ImageCount>{images.length}</ImageCount>}
              </>
            ) : (
              <PropertyImage>
                <MdHome />
              </PropertyImage>
            )}
          </PropertyImagesStack>
          <ListPropertyDetails>
            <ListPropertyTitle
              onClick={() => handleShowDetails(property)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title='Clique para ver detalhes'
            >
              {(() => {
                const typeInfo = getPropertyTypeIcon(property.type);
                const TypeIcon = typeInfo.icon;
                const fullTitle = property.title || 'Propriedade sem título';
                const displayTitle =
                  fullTitle.length > 36
                    ? `${fullTitle.slice(0, 36)}…`
                    : fullTitle;
                return (
                  <>
                    <TypeIcon
                      size={20}
                      style={{ color: typeInfo.color, flexShrink: 0 }}
                    />
                    <span
                      style={{
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {displayTitle}
                    </span>
                    {property.acceptsNegotiation &&
                      (property.pendingOffersCount ?? 0) > 0 && (
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedPropertyForOffers(property);
                            setShowOffersModal(true);
                          }}
                          style={{
                            marginLeft: '8px',
                            background: '#F59E0B',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0,
                          }}
                          title={`${property.pendingOffersCount} oferta(s) pendente(s)`}
                        >
                          💬 {property.pendingOffersCount}
                        </span>
                      )}
                  </>
                );
              })()}
            </ListPropertyTitle>
            <ListPropertyCode>
              {property.code ? `#${property.code}` : 'Código não informado'}
            </ListPropertyCode>
          </ListPropertyDetails>
        </PropertyInfo>

        <TabletHidden>
          <ListPropertyLocation>
            {property.city && property.state ? (
              <>
                <MdLocationOn size={16} />
                {property.city}, {property.state}
              </>
            ) : (
              <span
                style={{
                  color: 'var(--color-text-secondary)',
                  fontStyle: 'italic',
                  fontSize: '14px',
                }}
              >
                Localização não informada
              </span>
            )}
          </ListPropertyLocation>
        </TabletHidden>

        <MobileHidden>
          <PropertyType style={{ color: pricing.color }}>
            {pricing.display || 'Tipo não informado'}
          </PropertyType>
        </MobileHidden>

        <ListPropertyPrice>
          {pricing.priceFormatted || 'Preço não informado'}
        </ListPropertyPrice>

        <MobileHidden>
          <PropertySpecs>
            <PropertySpec>
              {property.bedrooms && property.bedrooms > 0 ? (
                <>
                  <MdBed size={14} />
                  {property.bedrooms}
                </>
              ) : (
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    fontStyle: 'italic',
                  }}
                >
                  <MdBed size={14} />-
                </span>
              )}
            </PropertySpec>
            <PropertySpec>
              {property.bathrooms && property.bathrooms > 0 ? (
                <>
                  <MdBathroom size={14} />
                  {property.bathrooms}
                </>
              ) : (
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    fontStyle: 'italic',
                  }}
                >
                  <MdBathroom size={14} />-
                </span>
              )}
            </PropertySpec>
            <PropertySpec>
              {property.builtArea && property.builtArea > 0 ? (
                <>
                  <MdSquareFoot size={14} />
                  {property.builtArea}m²
                </>
              ) : (
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    fontStyle: 'italic',
                  }}
                >
                  <MdSquareFoot size={14} />-
                </span>
              )}
            </PropertySpec>
          </PropertySpecs>
        </MobileHidden>

        <RowActions>
          <ActionsMenuButton
            onClick={() => {
              if (!canDoAnyPropertyAction) return;
              setOpenActionsMenuId(prev =>
                prev === property.id ? null : property.id
              );
            }}
            disabled={!canDoAnyPropertyAction}
            title={
              !canDoAnyPropertyAction
                ? 'Você não tem permissão para ações nesta propriedade'
                : 'Ações'
            }
            style={{
              opacity: canDoAnyPropertyAction ? 1 : 0.6,
              cursor: canDoAnyPropertyAction ? 'pointer' : 'not-allowed',
              pointerEvents: canDoAnyPropertyAction ? 'auto' : 'none',
            }}
          >
            Ações
          </ActionsMenuButton>
          {openActionsMenuId === property.id && (
            <ActionsMenu>
              <ActionsMenuItem
                onClick={() => hasPropertyView && handleShowDetails(property)}
                disabled={!hasPropertyView}
                title='Visualizar todos os detalhes e informações completas da propriedade'
              >
                <MdVisibility /> Ver detalhes
              </ActionsMenuItem>
              {property.acceptsNegotiation && (
                <ActionsMenuItem
                  onClick={() => {
                    if (!hasPropertyView) return;
                    setSelectedPropertyForOffers(property);
                    setShowOffersModal(true);
                    setOpenActionsMenuId(null);
                  }}
                  disabled={!hasPropertyView}
                  title={
                    (property.pendingOffersCount ?? 0) > 0
                      ? `${property.pendingOffersCount} oferta(s) pendente(s) - Clique para visualizar e gerenciar`
                      : 'Visualizar e gerenciar ofertas recebidas para esta propriedade'
                  }
                >
                  <MdComment /> Ver Ofertas
                  {(property.pendingOffersCount ?? 0) > 0 && (
                    <span
                      style={{
                        marginLeft: '8px',
                        background: '#F59E0B',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}
                    >
                      {property.pendingOffersCount}
                    </span>
                  )}
                </ActionsMenuItem>
              )}
              {property.status === PropertyStatusEnum.AVAILABLE &&
                !property.hasPendingFinancialApproval &&
                property.salePrice &&
                property.salePrice > 0 && (
                  <ActionsMenuItem
                    onClick={() =>
                      hasPropertyUpdate && handleOpenMarkAsSoldModal(property)
                    }
                    disabled={!hasPropertyUpdate}
                    title='Marcar esta propriedade como vendida e alterar seu status'
                  >
                    <MdCheckCircle /> Marcar como vendida
                  </ActionsMenuItem>
                )}
              {property.status === PropertyStatusEnum.AVAILABLE &&
                !property.hasPendingFinancialApproval &&
                property.rentPrice &&
                property.rentPrice > 0 && (
                  <ActionsMenuItem
                    onClick={() =>
                      hasPropertyUpdate && handleOpenMarkAsRentedModal(property)
                    }
                    disabled={!hasPropertyUpdate}
                    title='Marcar esta propriedade como alugada e alterar seu status'
                  >
                    <MdHome /> Marcar como alugada
                  </ActionsMenuItem>
                )}
              {(() => {
                const validation = canPublishProperty(property);
                const isDisabled =
                  !hasPropertyUpdate ||
                  (!property.isAvailableForSite && !validation.canPublish);
                const tooltipMessage = !hasPropertyUpdate
                  ? 'Você não tem permissão para publicar propriedades no site'
                  : property.isAvailableForSite
                  ? 'Propriedade está visível no site Intellisys - Clique para ocultar'
                  : validation.canPublish
                    ? 'Propriedade não está visível no site Intellisys - Clique para tornar pública'
                    : `Não é possível publicar: ${validation.reason}`;

                const menuItem = (
                  <ActionsMenuItem
                    onClick={async () => {
                      if (isDisabled) return;
                      setOpenActionsMenuId(null);
                      await handleTogglePublicSite(property);
                    }}
                    disabled={isDisabled}
                    style={{
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                    title={tooltipMessage}
                  >
                    {property.isAvailableForSite ? (
                      <>
                        <MdLock size={18} />
                        <span>Ocultar do Site</span>
                      </>
                    ) : (
                      <>
                        <MdPublic size={18} />
                        <span>Publicar no Site</span>
                      </>
                    )}
                  </ActionsMenuItem>
                );

                return isDisabled ? (
                  <Tooltip content={tooltipMessage} placement='left'>
                    {menuItem}
                  </Tooltip>
                ) : (
                  menuItem
                );
              })()}
              {hasAIAssistantModule &&
                property.status === PropertyStatusEnum.AVAILABLE && (
                  <ActionsMenuItem
                    onClick={async () => {
                      setShowPredictiveModal(true);
                      setOpenActionsMenuId(null);
                      setPredictiveAnalysis(null); // Limpar análise anterior
                      const result = await predict(property.id);
                      if (result && !Array.isArray(result)) {
                        setPredictiveAnalysis(result);
                      }
                    }}
                    title='Obter análise preditiva com IA sobre valor, tempo de venda e recomendações'
                  >
                    <MdAutoAwesome /> Análise Preditiva (IA)
                  </ActionsMenuItem>
                )}
              <ActionsMenuItem
                onClick={() =>
                  hasPropertyUpdate &&
                  navigate(`/properties/edit/${property.id}`)
                }
                disabled={!hasPropertyUpdate}
                title='Editar informações e detalhes da propriedade'
              >
                <MdEdit /> Editar
              </ActionsMenuItem>
              <ActionsMenuItem
                onClick={() => {
                  if (hasPropertyDelete) {
                    handleDeleteProperty(property);
                    setOpenActionsMenuId(null);
                  }
                }}
                disabled={!hasPropertyDelete}
                title='Excluir permanentemente esta propriedade do sistema'
              >
                <MdDelete /> Excluir
              </ActionsMenuItem>
            </ActionsMenu>
          )}
        </RowActions>

        {/* Versão mobile com mais detalhes */}
        <MobileOnly style={{ gridColumn: '1 / -1' }}>
          <MobilePropertyDetails>
            <MobileDetailRow>
              <MobileDetailLabel>Localização:</MobileDetailLabel>
              <MobileDetailValue>
                {property.city}, {property.state}
              </MobileDetailValue>
            </MobileDetailRow>
            <MobileDetailRow>
              <MobileDetailLabel>Tipo:</MobileDetailLabel>
              <MobileDetailValue style={{ color: pricing.color }}>
                {pricing.display}
              </MobileDetailValue>
            </MobileDetailRow>
            <MobileDetailRow>
              <MobileDetailLabel>Quartos:</MobileDetailLabel>
              <MobileDetailValue>
                {property.bedrooms} | Banheiros: {property.bathrooms} | Área:{' '}
                {property.builtArea || '0'}m²
              </MobileDetailValue>
            </MobileDetailRow>
          </MobilePropertyDetails>
        </MobileOnly>
      </PropertyRow>
    );
  };

  if (error) {
    return (
      <Layout>
        <PageContainer>
          <PageContent>
            <PageHeader>
              <PageTitleContainer>
                <PageTitle>Propriedades</PageTitle>
                <PageSubtitle>Gerencie seu portfólio imobiliário</PageSubtitle>
              </PageTitleContainer>
            </PageHeader>
            <EmptyState>
              <EmptyStateIcon>
                <MdHome style={{ fontSize: 64, color: 'var(--color-error)' }} />
              </EmptyStateIcon>
              <EmptyStateTitle style={{ color: 'var(--color-error)' }}>
                Erro ao carregar propriedades
              </EmptyStateTitle>
              <EmptyStateDescription>
                Não foi possível carregar as propriedades. Tente recarregar a
                página.
              </EmptyStateDescription>
            </EmptyState>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <PageContainer>
          <PageContent>
            <PageHeader>
              <PageTitleContainer>
                <PageTitle>Propriedades</PageTitle>
                <PageSubtitle>Gerencie seu portfólio imobiliário</PageSubtitle>
              </PageTitleContainer>
            </PageHeader>
            <PropertiesListContainer>
              <ListHeader>
                <div>Propriedade</div>
                <TabletHidden>
                  <div>Localização</div>
                </TabletHidden>
                <MobileHidden>
                  <div>Tipo</div>
                </MobileHidden>
                <div>Preço</div>
                <MobileHidden>
                  <div>Especificações</div>
                </MobileHidden>
                <div>Ações</div>
              </ListHeader>
              {Array.from({ length: 8 }).map((_, index) => (
                <ShimmerRow key={index}>
                  <PropertyInfo>
                    <ShimmerBox $w="88px" $h="60px" style={{ flexShrink: 0 }} />
                    <ListPropertyDetails>
                      <ShimmerBox $w="85%" $h="16px" style={{ marginBottom: '6px' }} />
                      <ShimmerBox $w="55%" $h="12px" />
                    </ListPropertyDetails>
                  </PropertyInfo>
                  <TabletHidden>
                    <ShimmerBox $w="90%" $h="14px" style={{ margin: '0 auto' }} />
                  </TabletHidden>
                  <MobileHidden>
                    <ShimmerBox $w="75%" $h="14px" style={{ margin: '0 auto' }} />
                  </MobileHidden>
                  <ShimmerBox $w="80%" $h="16px" style={{ margin: '0 auto' }} />
                  <MobileHidden>
                    <PropertySpecs>
                      <ShimmerBox $w="36px" $h="20px" />
                      <ShimmerBox $w="36px" $h="20px" />
                      <ShimmerBox $w="40px" $h="20px" />
                    </PropertySpecs>
                  </MobileHidden>
                  <RowActions>
                    <ShimmerBox $w="72px" $h="36px" />
                  </RowActions>
                </ShimmerRow>
              ))}
            </PropertiesListContainer>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageContent>
          <PageHeader>
            <PageTitleContainer>
              <PageTitle>Propriedades</PageTitle>
              <PageSubtitle>Gerencie seu portfólio imobiliário</PageSubtitle>
            </PageTitleContainer>
            <HeaderActions>
              <PermissionButton
                permission='property:view'
                variant='secondary'
                size='medium'
                onClick={() => navigate('/properties/offers')}
                style={{ marginRight: '8px' }}
              >
                <MdComment />
                Ver Todas as Ofertas
              </PermissionButton>
              <PermissionButton
                permission='property:import'
                variant='secondary'
                size='medium'
                onClick={() => navigate('/properties/import-export')}
                style={{ marginRight: '8px' }}
                tooltip='Importar/Exportar Propriedades (requer property:import ou property:export)'
              >
                <MdFileUpload />
                Importar/Exportar
              </PermissionButton>
              {hasAIAssistantModule && (
                <OptimizationButton
                  onClick={() => navigate('/properties/optimization')}
                >
                  <MdAutoAwesome />
                  Otimização de Portfólio
                </OptimizationButton>
              )}
              {hasCondominiumPermission && (
                <>
                  {hasCondominiumView && (
                    <PermissionButton
                      permission='condominium:view'
                      variant='secondary'
                      size='medium'
                      onClick={() => navigate('/condominiums')}
                      style={{ marginRight: '8px' }}
                    >
                      <MdHome />
                      Condomínios
                    </PermissionButton>
                  )}
                  {hasCondominiumCreate && (
                    <PermissionButton
                      permission='condominium:create'
                      variant='secondary'
                      size='medium'
                      onClick={() => navigate('/condominiums/create')}
                      style={{ marginRight: '8px' }}
                    >
                      <MdAdd />
                      Novo Condomínio
                    </PermissionButton>
                  )}
                </>
              )}
              <PermissionButton
                permission='property:create'
                variant='primary'
                size='medium'
                onClick={() => navigate('/properties/create')}
              >
                <MdAdd />
                Nova Propriedade
              </PermissionButton>
            </HeaderActions>
          </PageHeader>

          <ActionsBar>
            <LeftActions>
              <SearchContainer>
                <SearchInput
                  type='text'
                  placeholder='Buscar propriedades...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <SearchIcon />
              </SearchContainer>

              <FilterToggle onClick={() => setShowFiltersModal(true)}>
                <MdFilterList />
                Filtros
                {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
              </FilterToggle>

              {hasIntelligentResults ? (
                <Tooltip
                  content='Limpar os resultados da busca inteligente e voltar para a visualização normal de propriedades'
                  placement='bottom'
                >
                  <FilterToggle
                    onClick={() => {
                      clearIntelligentSearch();
                    }}
                    style={{
                      backgroundColor: 'var(--color-error)',
                      color: 'white',
                    }}
                  >
                    Limpar Busca Inteligente
                  </FilterToggle>
                </Tooltip>
              ) : (
                <Tooltip
                  content='Busca inteligente com IA: Encontre propriedades ideais para um cliente específico baseado no perfil, preferências e critérios dele. A IA analisa automaticamente compatibilidade, localização, preço e características.'
                  placement='bottom'
                >
                  <IntelligentSearchButton
                    onClick={() => setShowIntelligentSearch(true)}
                  >
                    <MdAutoAwesome />
                    Busca Inteligente
                  </IntelligentSearchButton>
                </Tooltip>
              )}
            </LeftActions>
          </ActionsBar>

          {paginatedProperties.length === 0 ? (
            <EmptyState>
              <EmptyStateCard>
                <EmptyStateIcon>
                  {searchTerm || activeFiltersCount > 0 ? (
                    <MdSearch />
                  ) : (
                    <MdHome />
                  )}
                </EmptyStateIcon>
                <EmptyStateTitle>
                  {searchTerm || activeFiltersCount > 0
                    ? 'Nenhuma propriedade encontrada'
                    : 'Nenhuma propriedade cadastrada'}
                </EmptyStateTitle>
                <EmptyStateDescription>
                  {searchTerm || activeFiltersCount > 0
                    ? 'Tente ajustar os filtros ou termo de busca para encontrar propriedades'
                    : 'Comece cadastrando sua primeira propriedade e organize seu portfólio imobiliário'}
                </EmptyStateDescription>
                {!searchTerm && activeFiltersCount === 0 && (
                  <EmptyStateAction
                    onClick={() => {
                      if (hasPropertyCreate) navigate('/properties/create');
                    }}
                    disabled={!hasPropertyCreate}
                    title={
                      !hasPropertyCreate
                        ? 'Você não tem permissão para criar propriedades'
                        : 'Criar primeira propriedade'
                    }
                    style={{
                      opacity: hasPropertyCreate ? 1 : 0.6,
                      cursor: hasPropertyCreate ? 'pointer' : 'not-allowed',
                      pointerEvents: hasPropertyCreate ? 'auto' : 'none',
                    }}
                  >
                    <MdAdd />
                    Criar Primeira Propriedade
                  </EmptyStateAction>
                )}
                {(searchTerm || activeFiltersCount > 0) && (
                  <EmptyStateSecondaryAction
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({});
                      getProperties({}, { page: 1, limit: itemsPerPage });
                      setCurrentPage(1);
                    }}
                  >
                    Limpar Filtros
                  </EmptyStateSecondaryAction>
                )}
              </EmptyStateCard>
            </EmptyState>
          ) : (
            <>
              <DraggableContainer>
                <PropertiesListContainer>
                  <ListHeader>
                    <div>Propriedade</div>
                    <TabletHidden>
                      <div>Localização</div>
                    </TabletHidden>
                    <MobileHidden>
                      <div>Tipo</div>
                    </MobileHidden>
                    <div>Preço</div>
                    <MobileHidden>
                      <div>Especificações</div>
                    </MobileHidden>
                    <div>Ações</div>
                  </ListHeader>
                  {paginatedProperties.map(renderPropertyRow)}
                </PropertiesListContainer>
              </DraggableContainer>

              {totalPages > 1 && (
                <PaginationWrapper>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
                      <PaginationButton
                        key={page}
                        $active={page === effectivePage}
                        onClick={() => {
                          if (hasIntelligentResults) {
                            setCurrentPage(page);
                          } else {
                            getProperties(getCombinedFilters(), {
                              page,
                              limit: itemsPerPage,
                            });
                          }
                        }}
                      >
                        {page}
                      </PaginationButton>
                    )
                  )}
                </PaginationWrapper>
              )}
            </>
          )}
        </PageContent>
      </PageContainer>

      <PropertyFiltersDrawer
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPropertyToDelete(null);
        }}
        onConfirm={confirmDeleteProperty}
        title='Excluir Propriedade'
        message='Tem certeza que deseja excluir esta propriedade?'
        itemName={propertyToDelete?.title}
        isLoading={isDeleting}
      />

      {/* Modal de Confirmação de Marcar como Vendida */}
      <ConfirmDeleteModal
        isOpen={showMarkAsSoldModal}
        onClose={() => {
          setShowMarkAsSoldModal(false);
          setPropertyToMarkSold(null);
        }}
        onConfirm={confirmMarkAsSold}
        title='Marcar como Vendida'
        message='Tem certeza que deseja marcar esta propriedade como vendida?'
        itemName={propertyToMarkSold?.title}
        isLoading={isMarkingSold}
        variant='mark-as-sold'
      />

      {/* Modal de Confirmação de Marcar como Alugada */}
      <ConfirmDeleteModal
        isOpen={showMarkAsRentedModal}
        onClose={() => {
          setShowMarkAsRentedModal(false);
          setPropertyToMarkRented(null);
        }}
        onConfirm={confirmMarkAsRented}
        title='Marcar como Alugada'
        message='Tem certeza que deseja marcar esta propriedade como alugada?'
        itemName={propertyToMarkRented?.title}
        isLoading={isMarkingRented}
        variant='mark-as-rented'
      />

      {/* AI Assistant - Predictive Analysis Modal */}
      {hasAIAssistantModule && (
        <PredictiveAnalysisModal
          isOpen={showPredictiveModal}
          onClose={() => {
            setShowPredictiveModal(false);
            setPredictiveAnalysis(null);
          }}
          analysis={predictiveAnalysis}
          loading={predictiveLoading}
          error={predictiveError}
        />
      )}

      {/* Modal de Busca Inteligente */}
      <IntelligentSearchModal
        isOpen={showIntelligentSearch}
        onClose={() => {
          setShowIntelligentSearch(false);
        }}
        onSearchSuccess={() => {
          setShowIntelligentSearch(false);
          setCurrentPage(1);
        }}
        onSearch={async (clientId: string) => {
          await intelligentSearch({ clientId });
        }}
        isSearching={intelligentSearchLoading}
      />

      {/* Modal de Ofertas da Propriedade */}
      <PropertyOffersModal
        isOpen={showOffersModal}
        onClose={() => {
          setShowOffersModal(false);
          setSelectedPropertyForOffers(null);
          getProperties(getCombinedFilters(), {
            page: effectivePage,
            limit: itemsPerPage,
          });
        }}
        property={selectedPropertyForOffers}
      />
    </Layout>
  );
};

export default PropertiesPage;
