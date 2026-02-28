import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdArrowBack,
  MdSave,
  MdRefresh,
  MdSettings,
  MdTrendingUp,
  MdTouchApp,
  MdAttachMoney,
  MdPeople,
  MdDownload,
  MdExpandMore,
  MdExpandLess,
  MdAdd,
  MdEdit,
  MdFilterList,
  MdBarChart,
  MdTableChart,
  MdAssessment,
  MdSchedule,
  MdDelete,
  MdVisibility,
  MdMoreVert,
  MdCampaign,
} from 'react-icons/md';
import { FaFacebookF } from 'react-icons/fa';
import { Layout } from '../components/layout/Layout';
import { MetaCampaignsShimmer } from '../components/shimmer/MetaCampaignsShimmer';
import BarChart from '../components/charts/BarChart';
import { LineChart } from '../components/charts';
import { metaCampaignApi } from '../services/metaCampaignApi';
import { projectsApi } from '../services/projectsApi';
import { kanbanApi } from '../services/kanbanApi';
import { showSuccess, showError } from '../utils/notifications';
import type {
  MetaCampaignItem,
  MetaCampaignRedirectConfig,
  UpsertMetaCampaignRedirectRequest,
  MetaCrmLeadsStats,
  MetaLeadgenFormItem,
  MetaRoasItem,
  MetaAdSetItem,
  MetaAdItem,
  ScheduledMetaCampaignItem,
} from '../types/metaCampaign';
import type { KanbanProjectResponseDto } from '../types/kanban';
import { DashboardResumoExecutivoSection } from '../components/dashboard/DashboardResumoExecutivoSection';
import { InfoTooltip } from '../components/common/InfoTooltip';
import type { MetaOverviewStats } from '../types/dashboard';
import {
  PageContainer,
  BackButton,
  HeaderRow,
  Title,
  Subtitle,
  Toolbar,
  Select,
  IconButton,
  CreateCampaignBtn,
  CreateCampaignLink,
  ConfigLink,
  ModalOverlay,
  ModalBox,
  ModalTitle,
  ModalField,
  ModalActions,
  MetricsGrid,
  MetricsGridSecondary,
  SummaryStrip,
  StatusBar,
  ComparisonStrip,
  SummaryItem,
  SectionSubtitle,
  MetricCard,
  MetricIcon,
  MetricContent,
  MetricLabel,
  MetricLabelRow,
  MetricValue,
  SectionCard,
  SectionTitle,
  SectionTitleIcon,
  InfoBox,
  TableScrollHint,
  TableWrap,
  Table,
  Th,
  ThSticky,
  Td,
  TdSticky,
  SelectCell,
  SaveBtn,
  StatusBadge,
  ExpandBtn,
  DetailCell,
  DetailWrap,
  AdSetsSectionTitle,
  AdSetBlock,
  AdSetHeader,
  AdList,
  AdItem,
  NumCell,
  EmptyState,
  VerDetalhesBtn,
  FiltersSection,
  FilterRow,
  FilterLabel,
  FilterGroup,
  AccountChipsWrap,
  AccountChip,
  SearchInput,
  FilteredCount,
  ChartsSection,
  ChartsGrid,
  ChartCard,
  ChartTitle,
  ChartTitleRow,
  TabsWrap,
  TabButton,
  formatNumber,
  formatCurrency,
  escapeCsvCell,
  getStatusLabel,
  ScheduledThumb,
  ScheduledMenuWrap,
  ScheduledMenuButton,
  ScheduledMenuDropdown,
  ScheduledMenuItem,
  ScheduledPaginationWrap,
  ScheduledPaginationBtn,
  ScheduledPaginationInfo,
} from '../styles/pages/MetaCampaignsPageStyles';

const DATE_PRESETS: { value: string; label: string }[] = [
  { value: 'last_7d', label: 'Últimos 7 dias' },
  { value: 'last_30d', label: 'Últimos 30 dias' },
  { value: 'last_90d', label: 'Últimos 90 dias' },
];

const OBJECTIVE_LABELS: Record<string, string> = {
  OUTCOME_LEADS: 'Leads',
  OUTCOME_TRAFFIC: 'Tráfego',
  LINK_CLICKS: 'Cliques no link',
  CONVERSIONS: 'Conversões',
  MESSAGES: 'Mensagens',
  REACH: 'Alcance',
  BRAND_AWARENESS: 'Consciência de marca',
  VIDEO_VIEWS: 'Visualizações de vídeo',
  APP_INSTALLS: 'Instalações de app',
  PRODUCT_CATALOG_SALES: 'Vendas do catálogo',
};

const getObjectiveLabel = (objective?: string) =>
  (objective && OBJECTIVE_LABELS[objective]) || objective || '—';

const formatCampaignDate = (createdTime?: string) => {
  if (!createdTime) return null;
  try {
    const d = new Date(createdTime);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
};

const MetaCampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<MetaCampaignItem[]>([]);
  const [redirects, setRedirects] = useState<MetaCampaignRedirectConfig[]>([]);
  const [projects, setProjects] = useState<KanbanProjectResponseDto[]>([]);
  const [projectMembersMap, setProjectMembersMap] = useState<
    Record<string, Array<{ id: string; name: string; email: string }>>
  >({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState('last_30d');
  const [form, setForm] = useState<
    Record<
      string,
      {
        kanbanProjectId: string;
        responsibleUserId: string;
        postLeadTagIds?: string[];
        postLeadNote?: string;
      }
    >
  >({});
  const [teamTagsMap, setTeamTagsMap] = useState<
    Record<string, Array<{ id: string; name: string; color: string }>>
  >({});
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchName, setSearchName] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState<string>('');
  const [hasRedirectFilter, setHasRedirectFilter] = useState<string>(''); // '' | 'yes' | 'no'
  const [isTableDragging, setIsTableDragging] = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(
    null
  );
  const [adSetsMap, setAdSetsMap] = useState<Record<string, MetaAdSetItem[]>>(
    {}
  );
  const [adsMap, setAdsMap] = useState<Record<string, MetaAdItem[]>>({});
  const [loadingAdSetsId, setLoadingAdSetsId] = useState<string | null>(null);
  const [loadingAdsId, setLoadingAdsId] = useState<string | null>(null);
  const [expandedAdSetIds, setExpandedAdSetIds] = useState<Set<string>>(
    new Set()
  );
  const [crmLeadsStats, setCrmLeadsStats] = useState<MetaCrmLeadsStats | null>(
    null
  );
  const [previousTotals, setPreviousTotals] = useState<{
    impressions: number;
    clicks: number;
    spend: number;
    leads: number;
  } | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState<{
    tokenValid: boolean;
    syncLeads: boolean;
    hasRedirects: boolean;
  } | null>(null);
  const [dailyInsights, setDailyInsights] = useState<
    Array<{
      date: string;
      impressions: number;
      clicks: number;
      spend: number;
      leads: number;
    }>
  >([]);
  const [leadgenForms, setLeadgenForms] = useState<MetaLeadgenFormItem[]>([]);
  const [roasData, setRoasData] = useState<MetaRoasItem[]>([]);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const [manageModalCampaign, setManageModalCampaign] =
    useState<MetaCampaignItem | null>(null);
  const [manageForm, setManageForm] = useState({ name: '', status: '' });
  const [manageSubmitting, setManageSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'campanhas' | 'analise' | 'agendadas'
  >('campanhas');
  const [scheduledList, setScheduledList] = useState<
    ScheduledMetaCampaignItem[]
  >([]);
  const [scheduledFilter, setScheduledFilter] = useState<
    'all' | 'pending' | 'processed' | 'failed'
  >('all');
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [deletingScheduledId, setDeletingScheduledId] = useState<string | null>(
    null
  );
  const [scheduledMenuOpenId, setScheduledMenuOpenId] = useState<string | null>(null);
  const [scheduledMenuAnchor, setScheduledMenuAnchor] = useState<{ top: number; left: number } | null>(null);
  const [scheduledDetailItem, setScheduledDetailItem] = useState<ScheduledMetaCampaignItem | null>(null);
  const [scheduledPage, setScheduledPage] = useState(1);
  const location = useLocation();
  const scheduledMenuRef = useRef<HTMLDivElement>(null);
  const scheduledDropdownRef = useRef<HTMLDivElement>(null);

  const SCHEDULED_PAGE_SIZE = 12;
  const scheduledTotalPages = Math.max(1, Math.ceil(scheduledList.length / SCHEDULED_PAGE_SIZE));
  const scheduledPaginatedList = useMemo(
    () =>
      scheduledList.slice(
        (scheduledPage - 1) * SCHEDULED_PAGE_SIZE,
        scheduledPage * SCHEDULED_PAGE_SIZE
      ),
    [scheduledList, scheduledPage]
  );

  const accountList = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    campaigns.forEach(c => {
      const id = c.adAccountId ?? '';
      if (id && !seen.has(id))
        seen.set(id, { id, name: c.adAccountName || id });
    });
    return Array.from(seen.values());
  }, [campaigns]);

  const objectiveList = useMemo(() => {
    const seen = new Set<string>();
    campaigns.forEach(c => {
      const o = (c.objective || '').trim();
      if (o) seen.add(o);
    });
    return Array.from(seen).sort();
  }, [campaigns]);

  const campaignIdsWithRedirect = useMemo(
    () => new Set(redirects.map(r => r.metaCampaignId)),
    [redirects]
  );

  const filteredCampaigns = useMemo(() => {
    let list = campaigns;
    if (selectedAccountIds.length > 0) {
      const set = new Set(selectedAccountIds);
      list = list.filter(c => c.adAccountId && set.has(c.adAccountId));
    }
    if (statusFilter) {
      const status = statusFilter.toUpperCase();
      list = list.filter(
        c => (c.effective_status || c.status || '').toUpperCase() === status
      );
    }
    if (objectiveFilter) {
      list = list.filter(c => (c.objective || '').trim() === objectiveFilter);
    }
    if (hasRedirectFilter === 'yes') {
      list = list.filter(c => campaignIdsWithRedirect.has(c.id));
    } else if (hasRedirectFilter === 'no') {
      list = list.filter(c => !campaignIdsWithRedirect.has(c.id));
    }
    if (searchName.trim()) {
      const q = searchName.trim().toLowerCase();
      list = list.filter(c => (c.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [
    campaigns,
    selectedAccountIds,
    statusFilter,
    objectiveFilter,
    hasRedirectFilter,
    searchName,
    campaignIdsWithRedirect,
  ]);

  const chartLeadsData = useMemo(() => {
    const top = filteredCampaigns
      .slice()
      .sort((a, b) => (b.leads ?? 0) - (a.leads ?? 0))
      .slice(0, 12);
    return top.map(c => ({
      label:
        (c.name || c.id).slice(0, 35) +
        (c.name && c.name.length > 35 ? '…' : ''),
      value: c.leads ?? 0,
    }));
  }, [filteredCampaigns]);

  const chartSpendData = useMemo(() => {
    const top = filteredCampaigns
      .slice()
      .sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0))
      .slice(0, 12);
    return top.map(c => ({
      label:
        (c.name || c.id).slice(0, 35) +
        (c.name && c.name.length > 35 ? '…' : ''),
      value: c.spend ?? 0,
    }));
  }, [filteredCampaigns]);

  const formatDayLabel = (iso: string) => {
    const [, m, d] = iso.split('-');
    return d && m ? `${d}/${m}` : iso;
  };
  const dailyLeadsChartData = useMemo(() => {
    return dailyInsights.map(d => ({
      label: formatDayLabel(d.date),
      value: d.leads,
    }));
  }, [dailyInsights]);
  const dailySpendChartData = useMemo(() => {
    return dailyInsights.map(d => ({
      label: formatDayLabel(d.date),
      value: d.spend,
    }));
  }, [dailyInsights]);

  const chartCrmLeadsByCampaignData = useMemo(() => {
    const stats = crmLeadsStats?.byCampaign ?? [];
    if (stats.length === 0) return [];
    return stats.slice(0, 12).map(c => ({
      label:
        (c.campaignName || c.metaCampaignId).slice(0, 35) +
        ((c.campaignName || c.metaCampaignId).length > 35 ? '…' : ''),
      value: c.count,
    }));
  }, [crmLeadsStats]);

  const chartCrmLeadsByMonthData = useMemo(() => {
    const stats = crmLeadsStats?.byMonth ?? [];
    if (stats.length === 0) return [];
    return stats.map(m => ({ label: m.monthLabel, value: m.count }));
  }, [crmLeadsStats]);

  const chartLeadgenFormsData = useMemo(() => {
    if (!leadgenForms.length) return [];
    return leadgenForms.slice(0, 12).map(f => ({
      label:
        (f.formId || '').slice(0, 20) +
        (f.formId && f.formId.length > 20 ? '…' : ''),
      value: f.leadCount ?? 0,
    }));
  }, [leadgenForms]);

  const toggleAccount = (accountId: string) => {
    setSelectedAccountIds(prev => {
      const next = prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId];
      return next;
    });
  };

  const selectAllAccounts = () => setSelectedAccountIds([]);

  const isInteractiveElement = (el: EventTarget | null): boolean => {
    if (!el || !(el instanceof HTMLElement)) return false;
    const tag = el.tagName?.toUpperCase();
    if (tag === 'SELECT' || tag === 'INPUT' || tag === 'BUTTON' || tag === 'A')
      return true;
    if (el.closest?.('select, input, button, [role="button"]')) return true;
    return false;
  };

  const onTableMouseDown = useCallback((e: React.MouseEvent) => {
    if (isInteractiveElement(e.target)) return;
    const el = tableScrollRef.current;
    if (!el) return;
    dragStart.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    setIsTableDragging(true);
  }, []);

  const onTableMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isTableDragging) return;
      const el = tableScrollRef.current;
      if (!el) return;
      const dx = dragStart.current.x - e.clientX;
      el.scrollLeft = dragStart.current.scrollLeft + dx;
    },
    [isTableDragging]
  );

  const onTableMouseUp = useCallback(() => setIsTableDragging(false), []);
  const onTableMouseLeave = useCallback(() => setIsTableDragging(false), []);

  const onTableTouchStart = useCallback((e: React.TouchEvent) => {
    if (isInteractiveElement(e.target)) return;
    const el = tableScrollRef.current;
    if (!el || !e.touches[0]) return;
    dragStart.current = { x: e.touches[0].clientX, scrollLeft: el.scrollLeft };
    setIsTableDragging(true);
  }, []);

  const onTableTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isTableDragging || !e.touches[0]) return;
      e.preventDefault();
      const el = tableScrollRef.current;
      if (!el) return;
      const dx = dragStart.current.x - e.touches[0].clientX;
      el.scrollLeft = dragStart.current.scrollLeft + dx;
      dragStart.current = {
        x: e.touches[0].clientX,
        scrollLeft: el.scrollLeft,
      };
    },
    [isTableDragging]
  );

  const onTableTouchEnd = useCallback(() => setIsTableDragging(false), []);

  const loadProjectMembers = useCallback((projectId: string) => {
    if (!projectId) return;
    kanbanApi
      .getProjectMembers(projectId)
      .then(members => {
        const list = (members || [])
          .map((m: any) => ({
            id: m.user?.id ?? m.id,
            name: m.user?.name ?? '',
            email: m.user?.email ?? '',
          }))
          .filter((u: any) => u.id);
        setProjectMembersMap(pm => ({ ...pm, [projectId]: list }));
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const config = await metaCampaignApi.getConfig();
      const hasAdAccounts =
        (config?.adAccounts?.length ?? 0) > 0 || !!config?.adAccountId?.trim();
      if (!config || !hasAdAccounts) {
        setCampaigns([]);
        setRedirects([]);
        setIntegrationStatus(await metaCampaignApi.getIntegrationStatus().catch(() => null));
        setLoading(false);
        return;
      }

      const [
        campaignsRes,
        redirectsRes,
        projectsRes,
        crmStatsRes,
        prevTotalsRes,
        statusRes,
        dailyRes,
        formsRes,
        roasRes,
      ] = await Promise.all([
        metaCampaignApi.getCampaigns({
          insights: true,
          date_preset: datePreset,
        }),
        metaCampaignApi.getRedirectConfig(),
        projectsApi
          .getFilteredProjects({ limit: '100', page: '1', status: 'active' })
          .then(r => r.data ?? [])
          .catch(() => []),
        metaCampaignApi.getCrmLeadsStats(datePreset),
        metaCampaignApi.getPreviousTotals(datePreset),
        metaCampaignApi.getIntegrationStatus(),
        metaCampaignApi.getDailyInsights(datePreset),
        metaCampaignApi
          .getLeadgenForms(datePreset)
          .then(r => r.data ?? [])
          .catch(() => []),
        metaCampaignApi
          .getRoas(datePreset)
          .then(r => r.data ?? [])
          .catch(() => []),
      ]);
      setCampaigns(campaignsRes);
      setRedirects(redirectsRes);
      setProjects(Array.isArray(projectsRes) ? projectsRes : []);
      setCrmLeadsStats(crmStatsRes);
      setPreviousTotals(prevTotalsRes);
      setIntegrationStatus(statusRes);
      setDailyInsights(dailyRes.daily ?? []);
      setLeadgenForms(formsRes);
      setRoasData(roasRes);

      const initial: Record<
        string,
        {
          kanbanProjectId: string;
          responsibleUserId: string;
          postLeadTagIds?: string[];
          postLeadNote?: string;
        }
      > = {};
      campaignsRes.forEach(c => {
        const r = redirectsRes.find(x => x.metaCampaignId === c.id);
        initial[c.id] = {
          kanbanProjectId: r?.kanbanProjectId ?? '',
          responsibleUserId: r?.responsibleUserId ?? '',
          postLeadTagIds: r?.postLeadTagIds ?? undefined,
          postLeadNote: r?.postLeadNote ?? undefined,
        };
      });
      setForm(initial);
      const teamIds = [
        ...new Set(
          (Array.isArray(projectsRes) ? projectsRes : [])
            .map((p: any) => p.teamId)
            .filter(Boolean)
        ),
      ];
      const tagsByTeam: Record<
        string,
        Array<{ id: string; name: string; color: string }>
      > = {};
      await Promise.all(
        teamIds.map(async (tid: string) => {
          try {
            const list = await kanbanApi.getTeamTags(tid);
            tagsByTeam[tid] = list;
          } catch {
            tagsByTeam[tid] = [];
          }
        })
      );
      setTeamTagsMap(tagsByTeam);
      const projectIds = [
        ...new Set(
          Object.values(initial)
            .map(v => v.kanbanProjectId)
            .filter(Boolean)
        ),
      ];
      projectIds.forEach(pid => loadProjectMembers(pid));
    } catch (e: any) {
      showError(e?.message || 'Erro ao carregar campanhas.');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [datePreset, loadProjectMembers]);

  const loadScheduled = useCallback(async () => {
    setLoadingScheduled(true);
    try {
      const list = await metaCampaignApi.getScheduledCampaigns({
        status: scheduledFilter,
      });
      setScheduledList(list);
    } catch {
      setScheduledList([]);
    } finally {
      setLoadingScheduled(false);
    }
  }, [scheduledFilter]);

  useEffect(() => {
    if (activeTab === 'agendadas') loadScheduled();
  }, [activeTab, loadScheduled]);

  useEffect(() => {
    setScheduledPage(1);
  }, [scheduledFilter, scheduledList.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const fromButton = scheduledMenuRef.current?.contains(target);
      const fromDropdown = scheduledDropdownRef.current?.contains(target);
      if (!fromButton && !fromDropdown) {
        setScheduledMenuOpenId(null);
        setScheduledMenuAnchor(null);
      }
    };
    if (scheduledMenuOpenId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [scheduledMenuOpenId]);

  const handleDeleteScheduled = useCallback(
    async (id: string) => {
      setDeletingScheduledId(id);
      try {
        await metaCampaignApi.deleteScheduledCampaign(id);
        showSuccess('Agendamento removido da lista.');
        setScheduledList(prev => prev.filter(s => s.id !== id));
      } catch (e: any) {
        showError(e?.message || 'Erro ao remover.');
      } finally {
        setDeletingScheduledId(null);
      }
    },
    []
  );

  useEffect(() => {
    const state = location.state as { tab?: string } | undefined;
    if (state?.tab === 'scheduled') {
      setActiveTab('agendadas');
      loadScheduled();
    }
  }, [location.state?.tab, loadScheduled]);

  const openManageModal = useCallback((campaign: MetaCampaignItem) => {
    setManageModalCampaign(campaign);
    setManageForm({
      name: campaign.name || '',
      status:
        (campaign.effective_status || campaign.status || 'PAUSED').toUpperCase(),
    });
  }, []);

  const handleManageCampaign = useCallback(async () => {
    if (!manageModalCampaign) return;
    setManageSubmitting(true);
    try {
      await metaCampaignApi.updateCampaign(manageModalCampaign.id, {
        name: manageForm.name.trim() || undefined,
        status: manageForm.status || undefined,
      });
      showSuccess('Campanha atualizada na Meta.');
      setManageModalCampaign(null);
      load();
    } catch (e: any) {
      showError(e?.message || 'Erro ao atualizar campanha.');
    } finally {
      setManageSubmitting(false);
    }
  }, [manageModalCampaign, manageForm, load]);

  const toggleCampaignExpand = useCallback(
    async (campaignId: string) => {
      setExpandedCampaignId(prev => {
        if (prev === campaignId) {
          return null;
        }
        if (!adSetsMap[campaignId]) {
          setLoadingAdSetsId(campaignId);
          metaCampaignApi
            .getCampaignAdSets(campaignId)
            .then(res => {
              setAdSetsMap(m => ({ ...m, [campaignId]: res.data ?? [] }));
              setLoadingAdSetsId(null);
            })
            .catch(() => setLoadingAdSetsId(null));
        }
        return campaignId;
      });
    },
    [adSetsMap]
  );

  const toggleAdSetExpand = useCallback(
    (adSetId: string) => {
      setExpandedAdSetIds(prev => {
        const next = new Set(prev);
        if (next.has(adSetId)) next.delete(adSetId);
        else next.add(adSetId);
        return next;
      });
      if (!adsMap[adSetId]) {
        setLoadingAdsId(adSetId);
        metaCampaignApi
          .getAdSetAds(adSetId)
          .then(res => {
            setAdsMap(m => ({ ...m, [adSetId]: res.data ?? [] }));
            setLoadingAdsId(null);
          })
          .catch(() => setLoadingAdsId(null));
      }
    },
    [adsMap]
  );

  useEffect(() => {
    load();
  }, [load]);

  const metaOverviewStats: MetaOverviewStats | null = useMemo(() => {
    const revenue90d = (roasData ?? []).reduce((s, x) => s + (x.revenue || 0), 0);
    const activeCount = (campaigns ?? []).filter(
      c => (c.effective_status || c.status || '').toUpperCase() === 'ACTIVE'
    ).length;
    const p = previousTotals;
    const cpl = p && p.leads > 0 ? p.spend / p.leads : null;
    return { revenueFromAds90d: revenue90d, activeCampaignsCount: activeCount, cpl };
  }, [campaigns, roasData, previousTotals]);

  const periodDaysMeta = useMemo(() => {
    const map: Record<string, number> = { last_7d: 7, last_30d: 30, last_90d: 90 };
    return map[datePreset] ?? 30;
  }, [datePreset]);

  const handleSave = async (campaign: MetaCampaignItem) => {
    const values = form[campaign.id];
    if (!values?.kanbanProjectId) {
      showError('Selecione um funil para redirecionamento.');
      return;
    }
    setSavingId(campaign.id);
    try {
      const payload: UpsertMetaCampaignRedirectRequest = {
        metaCampaignId: campaign.id,
        metaCampaignName: campaign.name,
        adAccountId: campaign.adAccountId,
        kanbanProjectId: values.kanbanProjectId,
        responsibleUserId: values.responsibleUserId || undefined,
        postLeadTagIds: values.postLeadTagIds?.length
          ? values.postLeadTagIds
          : undefined,
        postLeadNote: values.postLeadNote?.trim() || undefined,
      };
      await metaCampaignApi.putRedirectConfig(payload);
      showSuccess(
        'Redirecionamento salvo. Leads desta campanha irão para o funil selecionado.'
      );
      load();
    } catch (e: any) {
      showError(e?.message || 'Erro ao salvar.');
    } finally {
      setSavingId(null);
    }
  };

  const updateForm = (
    campaignId: string,
    field:
      | 'kanbanProjectId'
      | 'responsibleUserId'
      | 'postLeadTagIds'
      | 'postLeadNote',
    value: string | string[]
  ) => {
    if (field === 'kanbanProjectId') {
      loadProjectMembers(value as string);
      setForm(prev => ({
        ...prev,
        [campaignId]: {
          ...prev[campaignId],
          kanbanProjectId: value as string,
          responsibleUserId: '',
        },
      }));
    } else if (field === 'postLeadTagIds') {
      setForm(prev => ({
        ...prev,
        [campaignId]: {
          ...prev[campaignId],
          postLeadTagIds: value as string[],
        },
      }));
    } else if (field === 'postLeadNote') {
      setForm(prev => ({
        ...prev,
        [campaignId]: { ...prev[campaignId], postLeadNote: value as string },
      }));
    } else {
      const responsibleUserId: string = Array.isArray(value) ? value[0] ?? '' : value;
      setForm(prev => {
        const current = prev[campaignId];
        return {
          ...prev,
          [campaignId]: {
            kanbanProjectId: current?.kanbanProjectId ?? '',
            responsibleUserId,
            postLeadTagIds: current?.postLeadTagIds,
            postLeadNote: current?.postLeadNote,
          },
        };
      });
    }
  };

  const handleExportCsv = useCallback(() => {
    const headers = [
      'Campanha',
      'Conta',
      'Objetivo',
      'Status',
      'Impressões',
      'Cliques',
      'Gasto (R$)',
      'Leads',
      'Funil',
      'Responsável',
    ];
    const rows = filteredCampaigns.map(c => {
      const r = redirects.find(x => x.metaCampaignId === c.id);
      const projId = form[c.id]?.kanbanProjectId || r?.kanbanProjectId;
      const project = projects.find(p => p.id === projId);
      const respId = form[c.id]?.responsibleUserId || r?.responsibleUserId;
      const members = projId ? (projectMembersMap[projId] ?? []) : [];
      const resp = members.find(m => m.id === respId);
      return [
        escapeCsvCell(c.name || c.id),
        escapeCsvCell(c.adAccountName || c.adAccountId || ''),
        escapeCsvCell(c.objective || ''),
        escapeCsvCell(getStatusLabel(c.effective_status || c.status)),
        (c.impressions ?? 0).toLocaleString('pt-BR'),
        (c.clicks ?? 0).toLocaleString('pt-BR'),
        (c.spend ?? 0).toFixed(2),
        String(c.leads ?? 0),
        escapeCsvCell(project?.name ?? ''),
        escapeCsvCell(resp?.name ?? ''),
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campanhas-meta-${datePreset}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Relatório exportado.');
  }, [
    filteredCampaigns,
    redirects,
    form,
    projects,
    projectMembersMap,
    datePreset,
  ]);

  const totals = useMemo(
    () => ({
      impressions: filteredCampaigns.reduce(
        (s, c) => s + (c.impressions ?? 0),
        0
      ),
      clicks: filteredCampaigns.reduce((s, c) => s + (c.clicks ?? 0), 0),
      spend: filteredCampaigns.reduce((s, c) => s + (c.spend ?? 0), 0),
      leads: filteredCampaigns.reduce((s, c) => s + (c.leads ?? 0), 0),
    }),
    [filteredCampaigns]
  );

  const crmLeadsTotal = crmLeadsStats?.total ?? 0;
  const captureRate =
    totals.leads > 0 ? Math.round((crmLeadsTotal / totals.leads) * 100) : 0;
  const cpl = totals.leads > 0 ? totals.spend / totals.leads : 0;
  const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;

  const roiSummary = useMemo(() => {
    const revenue = (roasData ?? []).reduce((s, x) => s + (x.revenue || 0), 0);
    const spend = totals.spend;
    const roas = spend > 0 ? revenue / spend : null;
    return { revenue, spend, roas, cpl };
  }, [roasData, totals.spend, cpl]);

  const summaryByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    filteredCampaigns.forEach(c => {
      const s = (c.effective_status || c.status || 'outros').toUpperCase();
      map[s] = (map[s] ?? 0) + 1;
    });
    return Object.entries(map)
      .map(([status, count]) => ({ status: getStatusLabel(status), count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredCampaigns]);

  const summaryByObjective = useMemo(() => {
    const map: Record<string, number> = {};
    filteredCampaigns.forEach(c => {
      const o = (c.objective || '').trim() || 'outros';
      map[o] = (map[o] ?? 0) + 1;
    });
    return Object.entries(map)
      .map(([objective, count]) => ({ objective, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredCampaigns]);

  const countWithFunnel = useMemo(
    () =>
      filteredCampaigns.filter(c => campaignIdsWithRedirect.has(c.id)).length,
    [filteredCampaigns, campaignIdsWithRedirect]
  );

  const comparisonVariation = useMemo(() => {
    if (!previousTotals) return null;
    const p = previousTotals;
    const vari = (current: number, prev: number) =>
      prev === 0
        ? current === 0
          ? 0
          : 100
        : Math.round(((current - prev) / prev) * 100);
    return {
      impressions: vari(totals.impressions, p.impressions),
      clicks: vari(totals.clicks, p.clicks),
      spend: vari(totals.spend, p.spend),
      leads: vari(totals.leads, p.leads),
    };
  }, [totals, previousTotals]);

  return (
    <Layout>
      <PageContainer>
        <BackButton
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/dashboard');
            }
          }}
          title='Voltar'
        >
          <MdArrowBack size={20} /> Voltar
        </BackButton>

        <HeaderRow>
          <div>
            <Title>
              <FaFacebookF size={28} color='#1877F2' />
              Campanhas META
            </Title>
            <Subtitle>
              Métricas das suas campanhas (Facebook/Instagram) e configuração de
              funil para leads.
            </Subtitle>
          </div>
          <Toolbar>
            <Select
              value={datePreset}
              onChange={e => setDatePreset(e.target.value)}
              title='Período das métricas'
            >
              {DATE_PRESETS.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
            <IconButton
              type='button'
              onClick={() => load()}
              disabled={loading}
              title='Atualizar'
            >
              <MdRefresh size={18} />
              Atualizar
            </IconButton>
            <IconButton
              type='button'
              onClick={handleExportCsv}
              disabled={filteredCampaigns.length === 0}
              title='Exportar relatório (CSV)'
            >
              <MdDownload size={18} />
              Exportar
            </IconButton>
            <CreateCampaignLink
              to='/integrations/meta-campaign/campaigns/create'
              title='Criar nova campanha na Meta'
            >
              <MdAdd size={18} />
              Criar campanha
            </CreateCampaignLink>
            <ConfigLink
              type='button'
              onClick={() => navigate('/integrations/meta-campaign/config')}
              title='Configurações da integração'
            >
              <MdSettings size={18} />
              Configurações
            </ConfigLink>
          </Toolbar>
        </HeaderRow>

        {integrationStatus && (
          <StatusBar>
            <strong>Status:</strong>
            <SummaryItem>
              Token <span className={integrationStatus.tokenValid ? 'up' : 'down'}>
                {integrationStatus.tokenValid ? 'válido' : 'inválido'}
              </span>
            </SummaryItem>
            <SummaryItem>Sync leads: {integrationStatus.syncLeads ? 'Ativo' : 'Inativo'}</SummaryItem>
            <SummaryItem>Funis: {integrationStatus.hasRedirects ? 'Configurados' : 'Nenhum'}</SummaryItem>
          </StatusBar>
        )}
        <InfoBox>
          Use a aba <strong>Campanhas</strong> para filtrar e configurar funis; a aba <strong>Análise</strong> para métricas e ROI; e <strong>Agendadas</strong> para ver e administrar campanhas agendadas pelo sistema.
        </InfoBox>

        {loading ? (
          <MetaCampaignsShimmer />
        ) : (
          <div>
            <TabsWrap>
              <TabButton
                $active={activeTab === 'campanhas'}
                onClick={() => setActiveTab('campanhas')}
              >
                <MdTableChart size={18} /> Campanhas
              </TabButton>
              <TabButton
                $active={activeTab === 'analise'}
                onClick={() => setActiveTab('analise')}
              >
                <MdAssessment size={18} /> Análise
              </TabButton>
              <TabButton
                $active={activeTab === 'agendadas'}
                onClick={() => setActiveTab('agendadas')}
              >
                <MdSchedule size={18} /> Agendadas
              </TabButton>
            </TabsWrap>

            {activeTab === 'analise' && (
              <>
            <SectionCard>
              <SectionTitle>
                <SectionTitleIcon><MdTrendingUp size={18} /></SectionTitleIcon>
                Visão geral
              </SectionTitle>
              <DashboardResumoExecutivoSection
                totalRevenue={roiSummary.revenue}
                leadsNow={crmLeadsStats?.total ?? 0}
                metaStats={metaOverviewStats}
                periodDays={periodDaysMeta}
                showCampaignWidgets={true}
                metaConnected={!!integrationStatus?.tokenValid}
              />
            </SectionCard>

            <SectionCard>
              <SectionTitle>
                <SectionTitleIcon><MdAttachMoney size={18} /></SectionTitleIcon>
                ROI do período
              </SectionTitle>
              <MetricsGrid style={{ marginBottom: 0 }}>
              <MetricCard title='Faturamento gerado por vendas vinculadas às campanhas (período)'>
                <MetricIcon $color='#10B981'>
                  <MdAttachMoney size={24} />
                </MetricIcon>
                <MetricContent>
                  <MetricLabelRow>
                    <MetricLabel>Faturamento gerado</MetricLabel>
                    <InfoTooltip content='Faturamento gerado por vendas vinculadas às campanhas (período)' direction='top-right' />
                  </MetricLabelRow>
                  <MetricValue>
                    {formatCurrency(roiSummary.revenue)}
                  </MetricValue>
                  <SectionSubtitle style={{ margin: 0, fontSize: '0.75rem' }}>
                    vendas fechadas (tarefas com valor)
                  </SectionSubtitle>
                </MetricContent>
              </MetricCard>
              <MetricCard title='Gasto total em anúncios no período (Meta)'>
                <MetricIcon $color='#F59E0B'>
                  <MdAttachMoney size={24} />
                </MetricIcon>
                <MetricContent>
                  <MetricLabelRow>
                    <MetricLabel>Gasto em anúncios</MetricLabel>
                    <InfoTooltip content='Gasto total em anúncios no período (Meta)' direction='top-right' />
                  </MetricLabelRow>
                  <MetricValue>{formatCurrency(roiSummary.spend)}</MetricValue>
                </MetricContent>
              </MetricCard>
              <MetricCard title='Retorno sobre gasto em anúncios: faturamento ÷ gasto'>
                <MetricIcon $color='#8B5CF6'>
                  <MdTrendingUp size={24} />
                </MetricIcon>
                <MetricContent>
                  <MetricLabelRow>
                    <MetricLabel>ROAS</MetricLabel>
                    <InfoTooltip content='Retorno sobre gasto em anúncios: faturamento ÷ gasto' direction='top-right' />
                  </MetricLabelRow>
                  <MetricValue>
                    {roiSummary.roas != null
                      ? `${roiSummary.roas.toFixed(2)}x`
                      : '—'}
                  </MetricValue>
                  <SectionSubtitle style={{ margin: 0, fontSize: '0.75rem' }}>
                    {roiSummary.roas != null
                      ? 'R$ 1 gasto = R$ ' + roiSummary.roas.toFixed(2) + ' em vendas'
                      : 'Sem gasto no período'}
                  </SectionSubtitle>
                </MetricContent>
              </MetricCard>
              <MetricCard title='Custo por lead (gasto ÷ leads Meta)'>
                <MetricIcon $color='#0EA5E9'>
                  <MdPeople size={24} />
                </MetricIcon>
                <MetricContent>
                  <MetricLabelRow>
                    <MetricLabel>CPL</MetricLabel>
                    <InfoTooltip content='Custo por lead (gasto ÷ leads Meta)' direction='top-right' />
                  </MetricLabelRow>
                  <MetricValue>{formatCurrency(roiSummary.cpl)}</MetricValue>
                </MetricContent>
              </MetricCard>
            </MetricsGrid>
            </SectionCard>
            {filteredCampaigns.length === 0 ? (
              <EmptyState>
                Ajuste os filtros na aba Campanhas para ver métricas e gráficos do período.
              </EmptyState>
            ) : (
              <>
            <SectionCard>
              <SectionTitle>
                <SectionTitleIcon><MdBarChart size={18} /></SectionTitleIcon>
                Métricas do período
              </SectionTitle>
                <MetricsGrid>
                  <MetricCard title='Total de impressões das campanhas no período (Meta)'>
                    <MetricIcon $color='#1877F2'>
                      <MdTrendingUp size={24} />
                    </MetricIcon>
                    <MetricContent>
                      <MetricLabelRow>
                        <MetricLabel>Impressões</MetricLabel>
                        <InfoTooltip content='Total de impressões das campanhas no período (Meta)' direction='top-right' />
                      </MetricLabelRow>
                      <MetricValue>
                        {formatNumber(totals.impressions)}
                      </MetricValue>
                    </MetricContent>
                  </MetricCard>
                  <MetricCard title='Total de cliques nas campanhas no período (Meta)'>
                    <MetricIcon $color='#10B981'>
                      <MdTouchApp size={24} />
                    </MetricIcon>
                    <MetricContent>
                      <MetricLabelRow>
                        <MetricLabel>Cliques</MetricLabel>
                        <InfoTooltip content='Total de cliques nas campanhas no período (Meta)' direction='top-right' />
                      </MetricLabelRow>
                      <MetricValue>{formatNumber(totals.clicks)}</MetricValue>
                    </MetricContent>
                  </MetricCard>
                  <MetricCard title='Gasto total em reais nas campanhas no período (Meta)'>
                    <MetricIcon $color='#F59E0B'>
                      <MdAttachMoney size={24} />
                    </MetricIcon>
                    <MetricContent>
                      <MetricLabelRow>
                        <MetricLabel>Gasto total</MetricLabel>
                        <InfoTooltip content='Gasto total em reais nas campanhas no período (Meta)' direction='top-right' />
                      </MetricLabelRow>
                      <MetricValue>{formatCurrency(totals.spend)}</MetricValue>
                    </MetricContent>
                  </MetricCard>
                  <MetricCard title='Total de leads gerados pelos formulários da Meta no período'>
                    <MetricIcon $color='#8B5CF6'>
                      <MdPeople size={24} />
                    </MetricIcon>
                    <MetricContent>
                      <MetricLabelRow>
                        <MetricLabel>Leads (Meta)</MetricLabel>
                        <InfoTooltip content='Total de leads gerados pelos formulários da Meta no período' direction='top-right' />
                      </MetricLabelRow>
                      <MetricValue>{formatNumber(totals.leads)}</MetricValue>
                    </MetricContent>
                  </MetricCard>
                </MetricsGrid>

                <MetricsGridSecondary>
                  <MetricCard title='Leads que foram capturados e criados como tarefas no seu CRM no período'>
                    <MetricIcon $color='#0EA5E9'>
                      <MdPeople size={24} />
                    </MetricIcon>
                    <MetricContent>
                      <MetricLabelRow>
                        <MetricLabel>Leads no CRM</MetricLabel>
                        <InfoTooltip content='Leads que foram capturados e criados como tarefas no seu CRM no período' direction='top-right' />
                      </MetricLabelRow>
                      <MetricValue>{formatNumber(crmLeadsTotal)}</MetricValue>
                      <SectionSubtitle
                        style={{ margin: 0, fontSize: '0.75rem' }}
                      >
                        capturados no período
                      </SectionSubtitle>
                    </MetricContent>
                  </MetricCard>
                  <MetricCard title='Percentual de leads da Meta que viraram tarefas no CRM (Meta → CRM)'>
                    <MetricIcon $color='#6366F1'>
                      <MdTrendingUp size={24} />
                    </MetricIcon>
                    <MetricContent>
                      <MetricLabelRow>
                        <MetricLabel>Taxa de captura</MetricLabel>
                        <InfoTooltip content='Percentual de leads da Meta que viraram tarefas no CRM (Meta → CRM)' direction='top-right' />
                      </MetricLabelRow>
                      <MetricValue>{captureRate}%</MetricValue>
                      <SectionSubtitle
                        style={{ margin: 0, fontSize: '0.75rem' }}
                      >
                        Meta → CRM
                      </SectionSubtitle>
                    </MetricContent>
                  </MetricCard>
                  <MetricCard title='Custo por lead: gasto total ÷ número de leads (Meta)'>
                    <MetricIcon $color='#F59E0B'>
                      <MdAttachMoney size={24} />
                    </MetricIcon>
                    <MetricContent>
                      <MetricLabelRow>
                        <MetricLabel>CPL (custo/lead)</MetricLabel>
                        <InfoTooltip content='Custo por lead: gasto total ÷ número de leads (Meta)' direction='top-right' />
                      </MetricLabelRow>
                      <MetricValue>{formatCurrency(cpl)}</MetricValue>
                    </MetricContent>
                  </MetricCard>
                  <MetricCard title='Custo por clique: gasto total ÷ número de cliques (Meta)'>
                    <MetricIcon $color='#14B8A6'>
                      <MdTouchApp size={24} />
                    </MetricIcon>
                    <MetricContent>
                      <MetricLabelRow>
                        <MetricLabel>CPC (custo/clique)</MetricLabel>
                        <InfoTooltip content='Custo por clique: gasto total ÷ número de cliques (Meta)' direction='top-right' />
                      </MetricLabelRow>
                  <MetricValue>{formatCurrency(cpc)}</MetricValue>
                </MetricContent>
              </MetricCard>
                </MetricsGridSecondary>

                {totals.leads > 0 && crmLeadsTotal === 0 && (
                  <InfoBox style={{ marginTop: 16, background: 'var(--color-warning-bg, #fef3c7)', borderColor: 'var(--color-warning, #f59e0b)' }}>
                    <strong>Leads da Meta ainda não aparecem no CRM?</strong> Para que os leads da Meta virem tarefas aqui: (1) ative <strong>Sync leads</strong> em Configurações; (2) cadastre a URL do webhook no app da Meta (a mesma URL exibida nas configurações); (3) na aba Campanhas, vincule cada campanha a um <strong>funil</strong> (redirecionamento). Assim, cada novo lead criará uma tarefa no funil escolhido.
                  </InfoBox>
                )}

                {comparisonVariation && (
                  <ComparisonStrip style={{ marginTop: 16, marginBottom: 0 }}>
                    <strong>Comparação com período anterior:</strong>
                    <SummaryItem>
                      <span
                        className={
                          comparisonVariation.impressions >= 0 ? 'up' : 'down'
                        }
                      >
                        Impressões{' '}
                        {comparisonVariation.impressions >= 0 ? '+' : ''}
                        {comparisonVariation.impressions}%
                      </span>
                    </SummaryItem>
                    <SummaryItem>
                      <span
                        className={
                          comparisonVariation.clicks >= 0 ? 'up' : 'down'
                        }
                      >
                        Cliques {comparisonVariation.clicks >= 0 ? '+' : ''}
                        {comparisonVariation.clicks}%
                      </span>
                    </SummaryItem>
                    <SummaryItem>
                      <span
                        className={
                          comparisonVariation.spend >= 0 ? 'up' : 'down'
                        }
                      >
                        Gasto {comparisonVariation.spend >= 0 ? '+' : ''}
                        {comparisonVariation.spend}%
                      </span>
                    </SummaryItem>
                    <SummaryItem>
                      <span
                        className={
                          comparisonVariation.leads >= 0 ? 'up' : 'down'
                        }
                      >
                        Leads {comparisonVariation.leads >= 0 ? '+' : ''}
                        {comparisonVariation.leads}%
                      </span>
                    </SummaryItem>
                  </ComparisonStrip>
                )}
                </SectionCard>

                <SectionCard>
                  <SectionTitle>
                    <SectionTitleIcon><MdBarChart size={18} /></SectionTitleIcon>
                    Gráficos e análises
                  </SectionTitle>
                <ChartsSection style={{ marginBottom: 24 }}>
                  <ChartTitle style={{ marginBottom: 16 }}>
                    Dados da Meta (campanhas)
                  </ChartTitle>
                  <ChartsGrid>
                    <ChartCard title='Quantidade de leads gerados pela Meta por campanha no período'>
                      <ChartTitleRow>
                        <ChartTitle>Leads (Meta) por campanha</ChartTitle>
                        <InfoTooltip content='Quantidade de leads gerados pela Meta por campanha no período' direction='top-right' />
                      </ChartTitleRow>
                      <BarChart
                        data={chartLeadsData}
                        label='Leads'
                        color='#8B5CF6'
                        emptyMessage='Nenhum lead no período'
                        horizontal
                      />
                    </ChartCard>
                    <ChartCard title='Gasto em reais por campanha no período (Meta)'>
                      <ChartTitleRow>
                        <ChartTitle>Gasto por campanha (R$)</ChartTitle>
                        <InfoTooltip content='Gasto em reais por campanha no período (Meta)' direction='top-right' />
                      </ChartTitleRow>
                      <BarChart
                        data={chartSpendData}
                        label='Gasto'
                        color='#F59E0B'
                        emptyMessage='Nenhum gasto no período'
                        horizontal
                      />
                    </ChartCard>
                  </ChartsGrid>
                </ChartsSection>

                <ChartsSection>
                  <ChartTitle style={{ marginBottom: 16 }}>
                    Evolução no tempo (por dia)
                  </ChartTitle>
                  <ChartsGrid>
                    <ChartCard title='Evolução diária de leads gerados pela Meta'>
                      <ChartTitleRow>
                        <ChartTitle>Leads por dia</ChartTitle>
                        <InfoTooltip content='Evolução diária de leads gerados pela Meta no período' direction='top-right' />
                      </ChartTitleRow>
                      <LineChart
                        data={dailyLeadsChartData}
                        label='Leads'
                        color='#8B5CF6'
                        emptyMessage='Nenhum dado diário no período'
                        loading={false}
                      />
                    </ChartCard>
                    <ChartCard title='Evolução diária do gasto em anúncios (R$)'>
                      <ChartTitleRow>
                        <ChartTitle>Gasto por dia (R$)</ChartTitle>
                        <InfoTooltip content='Evolução diária do gasto em anúncios no período' direction='top-right' />
                      </ChartTitleRow>
                      <LineChart
                        data={dailySpendChartData}
                        label='Gasto'
                        color='#F59E0B'
                        emptyMessage='Nenhum dado diário no período'
                        loading={false}
                      />
                    </ChartCard>
                  </ChartsGrid>
                </ChartsSection>

                <ChartsSection>
                  <ChartTitle style={{ marginBottom: 16 }}>
                    Leads no CRM (capturados no seu sistema)
                  </ChartTitle>
                  <ChartsGrid>
                    <ChartCard title='Leads capturados no CRM e criados como tarefas, por campanha'>
                      <ChartTitleRow>
                        <ChartTitle>Leads no CRM por campanha</ChartTitle>
                        <InfoTooltip content='Leads capturados no CRM e criados como tarefas, por campanha de origem' direction='top-right' />
                      </ChartTitleRow>
                      <BarChart
                        data={chartCrmLeadsByCampaignData}
                        label='Leads'
                        color='#10B981'
                        emptyMessage='Nenhum lead capturado no período'
                        horizontal
                      />
                    </ChartCard>
                    <ChartCard title='Leads capturados no CRM agrupados por mês'>
                      <ChartTitleRow>
                        <ChartTitle>Leads no CRM por mês</ChartTitle>
                        <InfoTooltip content='Leads capturados no CRM agrupados por mês' direction='top-right' />
                      </ChartTitleRow>
                      <BarChart
                        data={chartCrmLeadsByMonthData}
                        label='Leads'
                        color='#0EA5E9'
                        emptyMessage='Nenhum lead capturado no período'
                      />
                    </ChartCard>
                  </ChartsGrid>
                </ChartsSection>

                <ChartsSection>
                  <ChartTitle style={{ marginBottom: 16 }}>
                    Formulários de lead (Meta)
                  </ChartTitle>
                  <ChartsGrid>
                    <ChartCard title='Leads gerados por cada formulário de lead da Meta no período'>
                      <ChartTitleRow>
                        <ChartTitle>Leads por formulário (no período)</ChartTitle>
                        <InfoTooltip content='Leads gerados por cada formulário de lead da Meta no período' direction='top-right' />
                      </ChartTitleRow>
                      <BarChart
                        data={chartLeadgenFormsData}
                        label='Leads'
                        color='#8B5CF6'
                        horizontal
                      />
                    </ChartCard>
                    <ChartCard title='Retorno sobre gasto: receita fechada vinculada à campanha ÷ gasto em anúncios'>
                      <ChartTitleRow>
                        <ChartTitle>ROAS (gasto vs receita fechada)</ChartTitle>
                        <InfoTooltip content='Retorno sobre gasto: receita fechada vinculada à campanha ÷ gasto em anúncios' direction='top-right' />
                      </ChartTitleRow>
                      <Table>
                        <thead>
                          <tr>
                            <Th>Campanha</Th>
                            <Th style={{ textAlign: 'right' }}>Gasto</Th>
                            <Th style={{ textAlign: 'right' }}>Receita</Th>
                            <Th style={{ textAlign: 'right' }}>ROAS</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {roasData
                            .filter(r => r.spend > 0 || r.revenue > 0)
                            .slice(0, 12).length === 0 ? (
                            <tr>
                              <Td
                                colSpan={4}
                                style={{
                                  textAlign: 'center',
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                —
                              </Td>
                            </tr>
                          ) : (
                            roasData
                              .filter(r => r.spend > 0 || r.revenue > 0)
                              .slice(0, 12)
                              .map(r => (
                                <tr key={r.metaCampaignId}>
                                  <Td>
                                    {(r.campaignName || r.metaCampaignId).slice(
                                      0,
                                      40
                                    )}
                                    {r.campaignName &&
                                    r.campaignName.length > 40
                                      ? '…'
                                      : ''}
                                  </Td>
                                  <Td style={{ textAlign: 'right' }}>
                                    <NumCell>{formatCurrency(r.spend)}</NumCell>
                                  </Td>
                                  <Td style={{ textAlign: 'right' }}>
                                    <NumCell>
                                      {formatCurrency(r.revenue)}
                                    </NumCell>
                                  </Td>
                                  <Td style={{ textAlign: 'right' }}>
                                    <NumCell>{r.roas.toFixed(2)}x</NumCell>
                                  </Td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </Table>
                    </ChartCard>
                  </ChartsGrid>
                </ChartsSection>
                </SectionCard>
              </>
            )}
            </>
            )}

            {activeTab === 'campanhas' && (
              <div>
            {campaigns.length === 0 ? (
              <EmptyState>
                Nenhuma campanha encontrada. Verifique se a integração Meta está
                configurada com token e contas de anúncios corretos.
              </EmptyState>
            ) : (
              <>
            <SectionCard>
              <SectionTitle>
                <SectionTitleIcon><MdFilterList size={18} /></SectionTitleIcon>
                Filtros
              </SectionTitle>
              <FiltersSection style={{ marginBottom: 0 }}>
              {accountList.length > 1 && (
                <FilterRow>
                  <FilterLabel>Contas:</FilterLabel>
                  <AccountChipsWrap>
                    <AccountChip
                      $selected={selectedAccountIds.length === 0}
                      onClick={selectAllAccounts}
                      title='Mostrar todas as contas'
                    >
                      Todas ({campaigns.length})
                    </AccountChip>
                    {accountList.map(acc => {
                      const count = campaigns.filter(
                        c => c.adAccountId === acc.id
                      ).length;
                      const selected = selectedAccountIds.includes(acc.id);
                      return (
                        <AccountChip
                          key={acc.id}
                          $selected={selected}
                          onClick={() => toggleAccount(acc.id)}
                          title={acc.id}
                        >
                          {acc.name || acc.id} ({count})
                        </AccountChip>
                      );
                    })}
                  </AccountChipsWrap>
                </FilterRow>
              )}
              <FilterRow>
                <FilterGroup>
                  <FilterLabel title='Filtrar por status da campanha na Meta'>
                    Status:
                  </FilterLabel>
                  <Select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ minWidth: 120 }}
                    title='Status da campanha (Ativa, Pausada, etc.)'
                  >
                    <option value=''>Todos</option>
                    <option value='ACTIVE'>Ativa</option>
                    <option value='PAUSED'>Pausada</option>
                    <option value='ARCHIVED'>Arquivada</option>
                    <option value='DELETED'>Excluída</option>
                  </Select>
                </FilterGroup>
                {objectiveList.length > 0 && (
                  <FilterGroup>
                    <FilterLabel title='Filtrar por objetivo da campanha'>
                      Objetivo:
                    </FilterLabel>
                    <Select
                      value={objectiveFilter}
                      onChange={e => setObjectiveFilter(e.target.value)}
                      style={{ minWidth: 140 }}
                      title='Objetivo da campanha (ex.: LEADS, TRAFFIC)'
                    >
                      <option value=''>Todos</option>
                      {objectiveList.map(obj => (
                        <option key={obj} value={obj}>
                          {obj}
                        </option>
                      ))}
                    </Select>
                  </FilterGroup>
                )}
                <FilterGroup>
                  <FilterLabel title='Filtrar campanhas com ou sem funil configurado'>
                    Redirecionamento:
                  </FilterLabel>
                  <Select
                    value={hasRedirectFilter}
                    onChange={e => setHasRedirectFilter(e.target.value)}
                    style={{ minWidth: 140 }}
                    title='Com funil configurado ou sem funil'
                  >
                    <option value=''>Todos</option>
                    <option value='yes'>Com funil configurado</option>
                    <option value='no'>Sem funil</option>
                  </Select>
                </FilterGroup>
                <FilterGroup>
                  <FilterLabel title='Buscar por nome da campanha'>
                    Buscar:
                  </FilterLabel>
                  <SearchInput
                    type='text'
                    placeholder='Nome da campanha...'
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    title='Digite o nome da campanha para filtrar'
                  />
                </FilterGroup>
                <FilteredCount>
                  {filteredCampaigns.length === campaigns.length
                    ? `${campaigns.length} campanha(s)`
                    : `${filteredCampaigns.length} de ${campaigns.length} campanha(s)`}
                </FilteredCount>
              </FilterRow>
                </FiltersSection>
            </SectionCard>

            {filteredCampaigns.length === 0 ? (
              <EmptyState>
                Nenhuma campanha corresponde aos filtros. Tente alterar contas,
                status ou o texto da busca.
              </EmptyState>
            ) : (
              <>
                <SectionCard>
                  <SectionTitle>
                    <SectionTitleIcon><MdTableChart size={18} /></SectionTitleIcon>
                    Resumo das campanhas
                  </SectionTitle>
                <SummaryStrip style={{ marginBottom: 0 }}>
                  <SummaryItem title='Total de campanhas que passaram nos filtros selecionados'>
                    <strong>{filteredCampaigns.length}</strong> campanha(s) no
                    total
                  </SummaryItem>
                  {countWithFunnel > 0 && (
                    <SummaryItem title='Campanhas que têm funil do Kanban e responsável definidos para os leads'>
                      <strong>{countWithFunnel}</strong> com funil configurado
                    </SummaryItem>
                  )}
                  {summaryByStatus.slice(0, 4).map(({ status, count }) => (
                    <SummaryItem key={status}>
                      <strong>{count}</strong> {status}
                    </SummaryItem>
                  ))}
                  {summaryByObjective.length > 0 && (
                    <>
                      <span style={{ color: 'var(--color-border, #ccc)' }}>
                        |
                      </span>
                      {summaryByObjective
                        .slice(0, 3)
                        .map(({ objective, count }) => (
                          <SummaryItem key={objective}>
                            <strong>{count}</strong> {objective}
                          </SummaryItem>
                        ))}
                    </>
                  )}
                </SummaryStrip>
                </SectionCard>

                <SectionCard>
                  <SectionTitle>
                    <SectionTitleIcon><MdTableChart size={18} /></SectionTitleIcon>
                    Campanhas e funis
                  </SectionTitle>
                <TableScrollHint title='A tabela pode ser arrastada horizontalmente para ver todas as colunas'>
                  ← Arraste a tabela ou deslize para ver mais colunas →
                </TableScrollHint>
                <TableWrap
                  ref={tableScrollRef}
                  $isGrabbing={isTableDragging}
                  onMouseDown={onTableMouseDown}
                  onMouseMove={onTableMouseMove}
                  onMouseUp={onTableMouseUp}
                  onMouseLeave={onTableMouseLeave}
                  onTouchStart={onTableTouchStart}
                  onTouchMove={onTableTouchMove}
                  onTouchEnd={onTableTouchEnd}
                >
                  <Table>
                    <thead>
                      <tr>
                        <Th
                          style={{
                            width: 52,
                            minWidth: 52,
                            padding: '14px 10px',
                          }}
                          title='Ver conjuntos de anúncios e anúncios'
                        ></Th>
                        <ThSticky title='Nome da campanha na Meta'>
                          Campanha
                        </ThSticky>
                        <Th title='Conta de anúncios da Meta'>Conta</Th>
                        <Th title='Objetivo da campanha (ex.: LEADS, TRAFFIC)'>
                          Objetivo
                        </Th>
                        <Th title='Status atual na Meta (Ativa, Pausada, etc.)'>
                          Status
                        </Th>
                        <Th
                          style={{ textAlign: 'right' }}
                          title='Número de impressões no período'
                        >
                          Impressões
                        </Th>
                        <Th
                          style={{ textAlign: 'right' }}
                          title='Número de cliques no período'
                        >
                          Cliques
                        </Th>
                        <Th
                          style={{ textAlign: 'right' }}
                          title='Gasto em reais no período'
                        >
                          Gasto
                        </Th>
                        <Th
                          style={{ textAlign: 'right' }}
                          title='Leads gerados pela campanha na Meta'
                        >
                          Leads
                        </Th>
                        <Th title='Cada campanha pode mandar leads para um funil diferente. Selecione o funil de destino dos leads desta campanha (ou use o funil padrão da configuração da integração).'>
                          Funil
                        </Th>
                        <Th title='Usuário responsável pelas tarefas criadas a partir dos leads'>
                          Responsável (opcional)
                        </Th>
                        <Th
                          title='Tag e nota aplicadas ao criar a tarefa a partir do lead'
                          style={{ minWidth: 200, width: 200 }}
                        >
                          Automação pós-lead
                        </Th>
                        <Th
                          style={{ width: 100 }}
                          title='Salvar configuração de redirecionamento'
                        ></Th>
                        <Th style={{ width: 100 }} title='Editar nome/status na Meta'>
                          Gerenciar
                        </Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCampaigns.map(c => (
                        <React.Fragment key={c.id}>
                          <tr
                            onDoubleClick={() => {
                              if (expandedCampaignId !== c.id) {
                                toggleCampaignExpand(c.id);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Duplo clique para abrir os detalhes (ad sets e anúncios)"
                          >
                            <Td
                              style={{
                                padding: '12px 10px',
                                verticalAlign: 'middle',
                              }}
                            >
                              <ExpandBtn
                                type='button'
                                onClick={() => toggleCampaignExpand(c.id)}
                                title={
                                  expandedCampaignId === c.id
                                    ? 'Ocultar ad sets e anúncios'
                                    : 'Ver ad sets e anúncios'
                                }
                              >
                                {expandedCampaignId === c.id ? (
                                  <MdExpandLess size={20} />
                                ) : (
                                  <MdExpandMore size={20} />
                                )}
                              </ExpandBtn>
                            </Td>
                            <TdSticky>
                              <div>
                                <strong>{c.name || c.id}</strong>
                                {formatCampaignDate(c.created_time) && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                    Criada em {formatCampaignDate(c.created_time)}
                                  </div>
                                )}
                              </div>
                            </TdSticky>
                            <Td>
                              <span title={c.adAccountId}>
                                {c.adAccountName || c.adAccountId || '—'}
                              </span>
                            </Td>
                            <Td title={c.objective}>{getObjectiveLabel(c.objective)}</Td>
                            <Td>
                              <StatusBadge
                                $status={c.effective_status || c.status}
                              >
                                {getStatusLabel(c.effective_status || c.status)}
                              </StatusBadge>
                            </Td>
                            <Td style={{ textAlign: 'right' }}>
                              <NumCell>
                                {formatNumber(c.impressions ?? 0)}
                              </NumCell>
                            </Td>
                            <Td style={{ textAlign: 'right' }}>
                              <NumCell>{formatNumber(c.clicks ?? 0)}</NumCell>
                            </Td>
                            <Td style={{ textAlign: 'right' }}>
                              <NumCell>{formatCurrency(c.spend ?? 0)}</NumCell>
                            </Td>
                            <Td style={{ textAlign: 'right' }}>
                              <NumCell>{formatNumber(c.leads ?? 0)}</NumCell>
                            </Td>
                            <Td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <SelectCell
                                  value={form[c.id]?.kanbanProjectId ?? ''}
                                  onChange={e =>
                                    updateForm(
                                      c.id,
                                      'kanbanProjectId',
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value=''>Selecione o funil</option>
                                  {projects.map(p => (
                                    <option key={p.id} value={p.id}>
                                      {p.name}
                                    </option>
                                  ))}
                                </SelectCell>
                                {form[c.id]?.kanbanProjectId && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    Funil: {projects.find(p => p.id === form[c.id]?.kanbanProjectId)?.name ?? '—'}
                                  </span>
                                )}
                              </div>
                            </Td>
                            <Td>
                              <SelectCell
                                value={form[c.id]?.responsibleUserId ?? ''}
                                onChange={e =>
                                  updateForm(
                                    c.id,
                                    'responsibleUserId',
                                    e.target.value
                                  )
                                }
                                disabled={!form[c.id]?.kanbanProjectId}
                              >
                                <option value=''>
                                  {!form[c.id]?.kanbanProjectId
                                    ? 'Selecione um funil antes'
                                    : 'Nenhum'}
                                </option>
                                {(
                                  projectMembersMap[
                                    form[c.id]?.kanbanProjectId ?? ''
                                  ] ?? []
                                ).map(u => (
                                  <option key={u.id} value={u.id}>
                                    {u.name} {u.email ? `(${u.email})` : ''}
                                  </option>
                                ))}
                              </SelectCell>
                            </Td>
                            <Td
                              style={{
                                minWidth: 200,
                                width: 200,
                                verticalAlign: 'top',
                              }}
                            >
                              {(() => {
                                const proj = projects.find(
                                  p => p.id === form[c.id]?.kanbanProjectId
                                );
                                const tags = proj?.teamId
                                  ? (teamTagsMap[proj.teamId] ?? [])
                                  : [];
                                return (
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 8,
                                    }}
                                  >
                                    <Select
                                      multiple
                                      value={form[c.id]?.postLeadTagIds ?? []}
                                      onChange={e =>
                                        updateForm(
                                          c.id,
                                          'postLeadTagIds',
                                          Array.from(
                                            e.target.selectedOptions,
                                            o => o.value
                                          )
                                        )
                                      }
                                      disabled={!form[c.id]?.kanbanProjectId}
                                      title='Tags a aplicar ao criar lead'
                                      style={{
                                        minHeight: 36,
                                        fontSize: '0.8125rem',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                      }}
                                    >
                                      {tags.map(t => (
                                        <option key={t.id} value={t.id}>
                                          {t.name}
                                        </option>
                                      ))}
                                    </Select>
                                    <input
                                      type='text'
                                      placeholder='Nota automática (opcional)'
                                      title='Texto adicionado automaticamente à tarefa ao criar o lead'
                                      value={form[c.id]?.postLeadNote ?? ''}
                                      onChange={e =>
                                        updateForm(
                                          c.id,
                                          'postLeadNote',
                                          e.target.value
                                        )
                                      }
                                      disabled={!form[c.id]?.kanbanProjectId}
                                      style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        fontSize: '0.8125rem',
                                        border:
                                          '1px solid var(--color-border, #ddd)',
                                        borderRadius: 8,
                                        background:
                                          'var(--color-card-bg, #fff)',
                                        color: 'var(--color-text, #333)',
                                        boxSizing: 'border-box',
                                      }}
                                    />
                                  </div>
                                );
                              })()}
                            </Td>
                            <Td>
                              <SaveBtn
                                type='button'
                                title='Salvar funil, responsável e automação pós-lead desta campanha'
                                disabled={
                                  savingId === c.id ||
                                  !form[c.id]?.kanbanProjectId
                                }
                                onClick={() => handleSave(c)}
                              >
                                <MdSave size={16} />
                                {savingId === c.id ? 'Salvando...' : 'Salvar'}
                              </SaveBtn>
                            </Td>
                            <Td>
                              <IconButton
                                type='button'
                                title='Gerenciar campanha na Meta (nome, ativar/pausar)'
                                onClick={() => openManageModal(c)}
                              >
                                <MdEdit size={16} />
                                Gerenciar
                              </IconButton>
                            </Td>
                          </tr>
                          {expandedCampaignId === c.id && (
                            <tr>
                              <DetailCell colSpan={14}>
                                <DetailWrap>
                                  <AdSetsSectionTitle>
                                    Conjuntos de anúncios (Ad sets) e anúncios
                                  </AdSetsSectionTitle>
                                  {loadingAdSetsId === c.id ? (
                                    <p
                                      style={{
                                        margin: 0,
                                        color: 'var(--color-text-secondary)',
                                      }}
                                    >
                                      Carregando ad sets...
                                    </p>
                                  ) : (adSetsMap[c.id]?.length ?? 0) === 0 ? (
                                    <p
                                      style={{
                                        margin: 0,
                                        color: 'var(--color-text-secondary)',
                                      }}
                                    >
                                      Nenhum conjunto de anúncios ou a campanha
                                      não permite listagem.
                                    </p>
                                  ) : (
                                    (adSetsMap[c.id] ?? []).map(adSet => (
                                      <AdSetBlock key={adSet.id}>
                                        <AdSetHeader
                                          type='button'
                                          onClick={() =>
                                            toggleAdSetExpand(adSet.id)
                                          }
                                        >
                                          {expandedAdSetIds.has(adSet.id) ? (
                                            <MdExpandLess size={18} />
                                          ) : (
                                            <MdExpandMore size={18} />
                                          )}
                                          <span style={{ flex: 1 }}>
                                            {adSet.name || adSet.id}
                                          </span>
                                          <StatusBadge
                                            $status={
                                              adSet.effective_status ||
                                              adSet.status
                                            }
                                          >
                                            {getStatusLabel(
                                              adSet.effective_status ||
                                                adSet.status
                                            )}
                                          </StatusBadge>
                                        </AdSetHeader>
                                        {expandedAdSetIds.has(adSet.id) && (
                                          <AdList>
                                            {loadingAdsId === adSet.id ? (
                                              <AdItem>
                                                Carregando anúncios...
                                              </AdItem>
                                            ) : (adsMap[adSet.id]?.length ??
                                                0) === 0 ? (
                                              <AdItem>
                                                Nenhum anúncio neste conjunto.
                                              </AdItem>
                                            ) : (
                                              (adsMap[adSet.id] ?? []).map(
                                                ad => (
                                                  <AdItem key={ad.id}>
                                                    {ad.creative?.thumbnail_url || ad.creative?.image_url ? (
                                                      <img
                                                        src={ad.creative?.thumbnail_url || ad.creative?.image_url}
                                                        alt=""
                                                        style={{
                                                          width: 64,
                                                          height: 64,
                                                          objectFit: 'cover',
                                                          borderRadius: 8,
                                                          flexShrink: 0,
                                                        }}
                                                      />
                                                    ) : null}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                      <div style={{ fontWeight: 600, marginBottom: 2 }}>
                                                        {ad.name || ad.id}
                                                      </div>
                                                      {ad.creative?.title && (
                                                        <div style={{ fontSize: '0.8125rem', marginBottom: 2 }}>
                                                          {ad.creative.title}
                                                        </div>
                                                      )}
                                                      {ad.creative?.body && (
                                                        <div
                                                          style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--color-text-secondary)',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                          }}
                                                        >
                                                          {ad.creative.body}
                                                        </div>
                                                      )}
                                                    </div>
                                                    <StatusBadge
                                                      $status={
                                                        ad.effective_status ||
                                                        ad.status
                                                      }
                                                    >
                                                      {getStatusLabel(
                                                        ad.effective_status ||
                                                          ad.status
                                                      )}
                                                    </StatusBadge>
                                                    <VerDetalhesBtn
                                                      type="button"
                                                      onClick={e => {
                                                        e.stopPropagation();
                                                        navigate(
                                                          '/integrations/meta-campaign/campaigns/ad',
                                                          {
                                                            state: {
                                                              ad,
                                                              campaignName: c.name || c.id,
                                                              adSetName: adSet.name || adSet.id,
                                                            },
                                                          }
                                                        );
                                                      }}
                                                    >
                                                      <MdVisibility size={16} />
                                                      Ver detalhes
                                                    </VerDetalhesBtn>
                                                  </AdItem>
                                                )
                                              )
                                            )}
                                          </AdList>
                                        )}
                                      </AdSetBlock>
                                    ))
                                  )}
                                </DetailWrap>
                              </DetailCell>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
                </SectionCard>
              </>
            )}
              </>
            )}
          </div>
            )}

            {activeTab === 'agendadas' && (
              <SectionCard>
                <SectionTitle>
                  <SectionTitleIcon><MdSchedule size={18} /></SectionTitleIcon>
                  Campanhas agendadas
                </SectionTitle>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
                  Lista de campanhas criadas pelo sistema (agendadas), já criadas na Meta ou com falha. Você pode remover itens da lista a qualquer momento.
                </p>
                <FilterRow style={{ marginBottom: 16 }}>
                  <FilterLabel>Status:</FilterLabel>
                  <Select
                    value={scheduledFilter}
                    onChange={e =>
                      setScheduledFilter(e.target.value as 'all' | 'pending' | 'processed' | 'failed')
                    }
                    style={{ minWidth: 160 }}
                  >
                    <option value="all">Todas</option>
                    <option value="pending">Pendentes (ainda não criadas)</option>
                    <option value="processed">Criadas na Meta</option>
                    <option value="failed">Com erro</option>
                  </Select>
                  <IconButton
                    type="button"
                    onClick={loadScheduled}
                    disabled={loadingScheduled}
                    title="Atualizar lista"
                  >
                    <MdRefresh size={18} />
                    Atualizar
                  </IconButton>
                </FilterRow>
                {loadingScheduled ? (
                  <p style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Carregando...</p>
                ) : scheduledList.length === 0 ? (
                  <EmptyState>
                    Nenhum agendamento encontrado com o filtro selecionado.
                  </EmptyState>
                ) : (
                  <>
                    <TableWrap>
                      <Table>
                        <thead>
                          <tr>
                            <Th style={{ width: 72, minWidth: 72 }}>Mídia</Th>
                            <Th>Nome</Th>
                            <Th>Objetivo</Th>
                            <Th>Data/hora</Th>
                            <Th>Status</Th>
                            <Th style={{ width: 56 }}></Th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduledPaginatedList.map(row => {
                            const runAtBr = row.runAt
                              ? new Date(row.runAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })
                              : '—';
                            const statusLabel =
                              row.processedAt == null
                                ? 'Pendente'
                                : row.errorMessage
                                  ? 'Falhou'
                                  : 'Criada';
                            const statusColor =
                              row.processedAt == null
                                ? 'var(--color-warning, #f59e0b)'
                                : row.errorMessage
                                  ? 'var(--color-error, #ef4444)'
                                  : 'var(--color-success, #10b981)';
                            const thumbUrl = row.creativeImageUrl || null;
                            return (
                              <tr key={row.id}>
                                <Td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                                  <ScheduledThumb $hasImage={Boolean(thumbUrl)}>
                                    {thumbUrl ? (
                                      <img src={thumbUrl} alt="" />
                                    ) : row.creativeVideoUrl ? (
                                      <MdCampaign size={28} aria-hidden title="Vídeo" />
                                    ) : (
                                      <MdCampaign size={28} aria-hidden />
                                    )}
                                  </ScheduledThumb>
                                </Td>
                                <Td>
                                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{row.name}</div>
                                  {row.metaCampaignId && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }} title={row.metaCampaignId}>
                                      ID Meta: {row.metaCampaignId}
                                    </div>
                                  )}
                                  {row.errorMessage && !row.metaCampaignId && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: 2 }} title={row.errorMessage}>
                                      {row.errorMessage.slice(0, 60)}{row.errorMessage.length > 60 ? '…' : ''}
                                    </div>
                                  )}
                                </Td>
                                <Td>{getObjectiveLabel(row.objective)}</Td>
                                <Td>{runAtBr}</Td>
                                <Td>
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: statusColor }}>
                                    {statusLabel}
                                  </span>
                                </Td>
                                <Td style={{ padding: '8px', verticalAlign: 'middle' }}>
                                  <ScheduledMenuWrap ref={scheduledMenuOpenId === row.id ? scheduledMenuRef : undefined}>
                                    <ScheduledMenuButton
                                      type="button"
                                      onMouseDown={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      onClick={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (scheduledMenuOpenId === row.id) {
                                          setScheduledMenuOpenId(null);
                                          setScheduledMenuAnchor(null);
                                          return;
                                        }
                                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                        const dropdownWidth = 160;
                                        const dropdownHeight = 120;
                                        const gap = 4;
                                        const padding = 8;
                                        const spaceBelow = window.innerHeight - rect.bottom - gap;
                                        const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight + gap;
                                        const top = openAbove
                                          ? Math.max(padding, rect.top - dropdownHeight - gap)
                                          : Math.min(window.innerHeight - dropdownHeight - padding, rect.bottom + gap);
                                        const left = Math.max(
                                          padding,
                                          Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - padding)
                                        );
                                        setScheduledMenuAnchor({ top, left });
                                        setScheduledMenuOpenId(row.id);
                                      }}
                                      title="Mais opções"
                                      aria-haspopup="true"
                                      aria-expanded={scheduledMenuOpenId === row.id}
                                    >
                                      <MdMoreVert size={20} />
                                    </ScheduledMenuButton>
                                  </ScheduledMenuWrap>
                                </Td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </TableWrap>
                    {scheduledTotalPages > 1 && (
                      <ScheduledPaginationWrap>
                        <ScheduledPaginationBtn
                          type="button"
                          onClick={() => setScheduledPage(p => Math.max(1, p - 1))}
                          disabled={scheduledPage <= 1}
                        >
                          Anterior
                        </ScheduledPaginationBtn>
                        <ScheduledPaginationInfo>
                          Página {scheduledPage} de {scheduledTotalPages}
                          {scheduledList.length > 0 && (
                            <> ({scheduledList.length} agendamento{scheduledList.length !== 1 ? 's' : ''})</>
                          )}
                        </ScheduledPaginationInfo>
                        <ScheduledPaginationBtn
                          type="button"
                          onClick={() => setScheduledPage(p => Math.min(scheduledTotalPages, p + 1))}
                          disabled={scheduledPage >= scheduledTotalPages}
                        >
                          Próxima
                        </ScheduledPaginationBtn>
                      </ScheduledPaginationWrap>
                    )}
                  </>
                )}
              </SectionCard>
            )}

            {scheduledMenuOpenId &&
              scheduledMenuAnchor &&
              (() => {
                const row = scheduledPaginatedList.find(r => r.id === scheduledMenuOpenId);
                if (!row) return null;
                return createPortal(
                  <div
                    ref={scheduledDropdownRef}
                    style={{
                      position: 'fixed',
                      top: scheduledMenuAnchor.top,
                      left: scheduledMenuAnchor.left,
                      zIndex: 10000,
                    }}
                  >
                    <ScheduledMenuDropdown
                      style={{ position: 'relative', top: 0, marginTop: 0 }}
                    >
                      {!row.processedAt && (
                        <ScheduledMenuItem
                          type="button"
                          onClick={() => {
                            setScheduledMenuOpenId(null);
                            setScheduledMenuAnchor(null);
                            navigate(
                              `/integrations/meta-campaign/campaigns/scheduled/${row.id}/edit`,
                              { state: { item: row } }
                            );
                          }}
                        >
                          <MdEdit size={18} /> Editar
                        </ScheduledMenuItem>
                      )}
                      <ScheduledMenuItem
                        type="button"
                        onClick={() => {
                          setScheduledDetailItem(row);
                          setScheduledMenuOpenId(null);
                          setScheduledMenuAnchor(null);
                        }}
                      >
                        <MdVisibility size={18} /> Ver detalhes
                      </ScheduledMenuItem>
                      <ScheduledMenuItem
                        type="button"
                        onClick={() => {
                          handleDeleteScheduled(row.id);
                          setScheduledMenuOpenId(null);
                          setScheduledMenuAnchor(null);
                        }}
                        disabled={deletingScheduledId === row.id}
                      >
                        <MdDelete size={18} /> Remover
                      </ScheduledMenuItem>
                    </ScheduledMenuDropdown>
                  </div>,
                  document.body
                );
              })()}

          </div>
        )}

        {scheduledDetailItem && (
          <ModalOverlay onClick={() => setScheduledDetailItem(null)}>
            <ModalBox onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
              <ModalTitle>Detalhes do agendamento</ModalTitle>
              {(scheduledDetailItem.creativeImageUrl || scheduledDetailItem.creativeVideoUrl) && (
                <div style={{ marginBottom: 16 }}>
                  {scheduledDetailItem.creativeImageUrl ? (
                    <img
                      src={scheduledDetailItem.creativeImageUrl}
                      alt="Criativo"
                      style={{ width: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 8, background: 'var(--color-background-tertiary)' }}
                    />
                  ) : scheduledDetailItem.creativeVideoUrl ? (
                    <video
                      src={scheduledDetailItem.creativeVideoUrl}
                      controls
                      style={{ width: '100%', maxHeight: 240, borderRadius: 8, background: '#000' }}
                    />
                  ) : null}
                </div>
              )}
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: 'var(--color-text)' }}>Nome:</strong> {scheduledDetailItem.name}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: 'var(--color-text)' }}>Objetivo:</strong> {getObjectiveLabel(scheduledDetailItem.objective)}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: 'var(--color-text)' }}>Categoria:</strong> {scheduledDetailItem.specialAdCategories || '—'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: 'var(--color-text)' }}>Data/hora agendada:</strong> {scheduledDetailItem.runAt ? new Date(scheduledDetailItem.runAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }) : '—'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: 'var(--color-text)' }}>Criado em:</strong> {scheduledDetailItem.createdAt ? new Date(scheduledDetailItem.createdAt).toLocaleString('pt-BR') : '—'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: 'var(--color-text)' }}>Processado em:</strong> {scheduledDetailItem.processedAt ? new Date(scheduledDetailItem.processedAt).toLocaleString('pt-BR') : '—'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: 'var(--color-text)' }}>ID campanha Meta:</strong> {scheduledDetailItem.metaCampaignId || '—'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: 'var(--color-text)' }}>Conta anúncios:</strong> {scheduledDetailItem.adAccountId || '—'}</p>
                {scheduledDetailItem.errorMessage && (
                  <p style={{ margin: '8px 0 0 0', color: 'var(--color-error)', fontSize: '0.8125rem' }}><strong>Erro:</strong> {scheduledDetailItem.errorMessage}</p>
                )}
              </div>
              <ModalActions>
                <IconButton type="button" onClick={() => setScheduledDetailItem(null)}>Fechar</IconButton>
              </ModalActions>
            </ModalBox>
          </ModalOverlay>
        )}

        {manageModalCampaign && (
          <ModalOverlay
            onClick={() =>
              !manageSubmitting && setManageModalCampaign(null)
            }
          >
            <ModalBox onClick={e => e.stopPropagation()}>
              <ModalTitle>Gerenciar campanha na Meta</ModalTitle>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
                {manageModalCampaign.name || manageModalCampaign.id}
              </p>
              <ModalField>
                <label>Nome</label>
                <input
                  type="text"
                  value={manageForm.name}
                  onChange={e =>
                    setManageForm(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </ModalField>
              <ModalField>
                <label>Status</label>
                <select
                  value={manageForm.status}
                  onChange={e =>
                    setManageForm(prev => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="ACTIVE">Ativa</option>
                  <option value="PAUSED">Pausada</option>
                  <option value="ARCHIVED">Arquivada</option>
                  <option value="DELETED">Excluída</option>
                </select>
              </ModalField>
              <ModalActions>
                <IconButton
                  type="button"
                  onClick={() => setManageModalCampaign(null)}
                  disabled={manageSubmitting}
                >
                  Fechar
                </IconButton>
                <CreateCampaignBtn
                  type="button"
                  onClick={handleManageCampaign}
                  disabled={manageSubmitting}
                >
                  {manageSubmitting ? 'Salvando...' : 'Salvar'}
                </CreateCampaignBtn>
              </ModalActions>
            </ModalBox>
          </ModalOverlay>
        )}

      </PageContainer>
    </Layout>
  );
};

export default MetaCampaignsPage;
