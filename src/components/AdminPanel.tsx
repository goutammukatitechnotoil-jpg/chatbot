import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import {
  Plus,
  Trash2,
  Save,
  LayoutDashboard,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  Menu,
  X,
  TrendingUp,
  Activity,
  Palette,
  FileText,
  Edit,
  Database,
  MousePointer,
  Copy,
  Check,
  Code,
  UserCog,
  LogOut,
  Zap
} from 'lucide-react';
import { useChatbotConfig } from '../contexts/ChatbotConfigContext';
import { useLoading } from '../contexts/LoadingContext';
import { useTenant } from '../contexts/TenantContext';
import * as TeamService from '../services/teamService';
import { ROLE_PERMISSIONS, TeamRole } from '../types/team';
import { StatisticsCards } from './StatisticsCards';
import { ConfirmationModal } from './ConfirmationModal';
import { ConfigKeyService, type ConfigKeyData } from '../services/configKeyService';
import { FunnelChart } from './FunnelChart';
import { DateRangeFilter } from './DateRangeFilter';
import { FormBuilder } from './FormBuilder';
import { LeadList } from './LeadList';
import { ButtonList } from './ButtonList';
import TeamManagement from './TeamManagement';
import IntegrationSettings from './IntegrationSettings';
import WordCloud from './WordCloud';
import { Chatbot } from './Chatbot';
import { COUNTRIES } from '../constants/countries';
import { analyticsService, DateRange } from '../services/analyticsService';
import { buttonService } from '../services/buttonService';
import { AnalyticsMetrics, FunnelStage } from '../types/analytics';
import { formService } from '../services/formService';
import { CustomForm } from '../types/forms';
import { ContentService } from '../services/contentService';
import { ConfigService } from '../services/configService';
import SystemSettingsService from '../services/systemSettingsService';
import Swal from 'sweetalert2';

interface SliderImage {
  id?: string;
  image_url: string;
  link_url: string;
  order_index: number;
}

interface PredefinedSentence {
  id?: string;
  sentence: string;
  order_index: number;
}

type ActiveTab = 'dashboard' | 'sliders' | 'sentences' | 'forms' | 'buttons' | 'leads' | 'team' | 'test' | 'appearance' | 'integrations' | 'settings';

export function AdminPanel() {
  const { user, logout } = useTenant();
  const { setIsLoading } = useLoading();
  const mapRoleToTeamRole = (role?: string | null): TeamRole => {
    if (!role) return 'viewer';
    if (role === 'owner' || role === 'admin') return 'admin';
    if (role === 'editor') return 'editor';
    return 'viewer';
  };

  const router = useRouter();
  const currentUserRole: TeamRole = mapRoleToTeamRole(user?.role as string | undefined);
  const currentPermissions = ROLE_PERMISSIONS[currentUserRole];
  const canView = !!currentPermissions?.canView;
  const canEdit = !!currentPermissions?.canEdit;
  const canDelete = !!currentPermissions?.canDelete;
  const canAccessSettings = !!currentPermissions?.canAccessSettings;
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirmation(false);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, we still clear local state (which logout() does)
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [sliders, setSliders] = useState<SliderImage[]>([]);
  const [sentences, setSentences] = useState<PredefinedSentence[]>([]);
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | undefined>();
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);

  // Initialize active tab from sessionStorage (for dedicated page routes)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTab = sessionStorage.getItem('activeTab') as ActiveTab;
      if (storedTab) {
        setActiveTab(storedTab);
      }
    }
  }, []);

  useEffect(() => {
    loadForms();
    loadContent();
  }, []);

  const loadForms = async () => {
    const loadedForms = await formService.getForms();
    setForms(loadedForms);
  };

  const loadContent = async () => {
    try {
      setContentLoading(true);
      const content = await ContentService.getContent();

      // Convert slider_images to the format expected by the component
      const formattedSliders = content.slider_images.map((img, index) => ({
        image_url: img.image_url,
        link_url: img.link_url,
        order_index: index + 1
      }));

      // Convert predefined_sentences to the format expected by the component
      const formattedSentences = content.predefined_sentences.map((sentence, index) => ({
        sentence: sentence,
        order_index: index + 1
      }));



      setSliders(formattedSliders);
      setSentences(formattedSentences);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const addSlider = () => {
    setSliders([...sliders, { image_url: '', link_url: '', order_index: sliders.length + 1 }]);
  };

  const updateSlider = (index: number, field: keyof SliderImage, value: string | number) => {
    const updated = [...sliders];
    updated[index] = { ...updated[index], [field]: value };
    setSliders(updated);
  };

  const removeSlider = (index: number) => {
    setSliders(sliders.filter((_, i) => i !== index));
  };

  const addSentence = () => {
    setSentences([...sentences, { sentence: '', order_index: sentences.length + 1 }]);
  };

  const updateSentence = (index: number, value: string) => {
    const updated = [...sentences];
    updated[index] = { ...updated[index], sentence: value };
    setSentences(updated);
  };

  const removeSentence = (index: number) => {
    setSentences(sentences.filter((_, i) => i !== index));
  };

  const isDataUri = (url: string) => /^data:image\/[a-zA-Z]+;base64,/.test(url);

  const dataUriToFile = (dataUri: string, filename: string) => {
    const [meta, base64] = dataUri.split(',');
    const mimeMatch = meta.match(/data:([^;]+);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i += 1) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new File([uint8Array], filename, { type: mimeType });
  };

  const ensureSliderCloudinaryUrls = async () => {
    const updatedSliders = [...sliders];

    for (let i = 0; i < updatedSliders.length; i += 1) {
      const slider = updatedSliders[i];

      if (slider.image_url && isDataUri(slider.image_url)) {
        if (!canEdit) continue;

        try {
          const file = dataUriToFile(slider.image_url, `slider-${i + 1}.png`);
          const formData = new FormData();
          formData.append('image', file);

          const uploadResp = await fetch('/api/upload/slider', {
            method: 'POST',
            body: formData,
          });

          const uploadData = await uploadResp.json();
          if (uploadResp.ok && uploadData.url) {
            updatedSliders[i] = { ...slider, image_url: uploadData.url };
          } else {
            throw new Error(uploadData.error || 'Slider image upload failed while converting data URI');
          }
        } catch (err) {
          console.error('Failed to convert data URI slider image to Cloudinary URL:', err);
          throw new Error('Slider image needs a valid URL and was not uploaded successfully. Please reupload using the file picker.');
        }
      }
    }

    setSliders(updatedSliders);
    return updatedSliders;
  };

  const handleSave = async () => {
    setIsLoading(true, 'Saving configuration...');
    setIsSavingConfig(true);
    try {
      // Convert any data URI slider image_url values into Cloudinary URLs before saving
      const normalizedSliders = await ensureSliderCloudinaryUrls();

      console.log('Saving configuration:', { sliders: normalizedSliders, sentences });

      // Format sliders back to the API format
      const formattedSliders = normalizedSliders.map(slider => ({
        image_url: slider.image_url,
        link_url: slider.link_url,
        title: `Promo ${slider.order_index}`,
        description: `Promotional content ${slider.order_index}`
      }));

      // Extract just the sentence strings
      const formattedSentences = sentences.map(s => s.sentence);

      // Update content via API (include quick questions title)
      await ContentService.updateContent({
        slider_images: formattedSliders,
        predefined_sentences: formattedSentences
      });

      Swal.fire({
        title: 'Success!',
        text: 'Configuration saved successfully!',
        icon: 'success',
        confirmButtonColor: '#f37021',
      });
      console.log('Content saved to database');

    } catch (error) {
      console.error('Failed to save configuration:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save configuration. Please try again.',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setIsSavingConfig(false);
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard, url: '/dashboard' },
    { id: 'sliders' as ActiveTab, label: 'Slider Images', icon: ImageIcon, url: '/sliders' },
    { id: 'sentences' as ActiveTab, label: 'Quick Replies', icon: MessageSquare, url: '/quick-replies' },
    { id: 'forms' as ActiveTab, label: 'Custom Forms', icon: FileText, url: '/forms' },
    { id: 'buttons' as ActiveTab, label: 'Button Actions', icon: MousePointer, url: '/buttons' },
    { id: 'leads' as ActiveTab, label: 'Lead List', icon: Database, url: '/leads' },
    { id: 'team' as ActiveTab, label: 'Team Management', icon: UserCog, url: '/team' },
    { id: 'integrations' as ActiveTab, label: 'Integrations', icon: Zap, url: '/integrations' },
    { id: 'test' as ActiveTab, label: 'Test Chatbot', icon: MessageSquare, url: '/test-chatbot' },
    { id: 'appearance' as ActiveTab, label: 'Appearance', icon: Palette, url: '/appearance' },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings, url: '/settings' },
  ];

  const handleNavigation = async (item: typeof menuItems[0]) => {
    setActiveTab(item.id);
    sessionStorage.setItem('activeTab', item.id);
    if (typeof window !== 'undefined') {
      await router.push(item.url);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                <svg className="w-full h-full p-1" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="4" fill="#8B5CF6">
                    <animate attributeName="r" values="4;10;4" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="30" cy="50" r="4" fill="#EC4899">
                    <animate attributeName="r" values="4;8;4" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="70" cy="50" r="4" fill="#06B6D4">
                    <animate attributeName="r" values="4;8;4" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="20" cy="50" r="3" fill="#F59E0B">
                    <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="80" cy="50" r="3" fill="#10B981">
                    <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
              <span className="font-bold text-lg text-gray-900">Chatbot</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                      ? 'bg-[#f37021] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Admin Panel v1.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogoutClick}
                className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && <DashboardView sliders={sliders} sentences={sentences} />}
          {activeTab === 'sliders' && (
            <SlidersView
              sliders={sliders}
              addSlider={addSlider}
              updateSlider={updateSlider}
              removeSlider={removeSlider}
              onSave={handleSave}
              canEdit={canEdit}
              canDelete={canDelete}
              isSaving={isSavingConfig}
              isLoading={contentLoading}
            />
          )}
          {activeTab === 'sentences' && (
            <SentencesView
              sentences={sentences}
              addSentence={addSentence}
              updateSentence={updateSentence}
              removeSentence={removeSentence}
              onSave={handleSave}
              canEdit={canEdit}
              canDelete={canDelete}
              isSaving={isSavingConfig}
              isLoading={contentLoading}
            />
          )}
          {activeTab === 'forms' && (
            <FormsView
              forms={forms}
              selectedFormId={selectedFormId}
              isCreatingForm={isCreatingForm}
              onSelectForm={setSelectedFormId}
              onCreateNew={() => {
                setIsCreatingForm(true);
                setSelectedFormId(undefined);
              }}
              onFormSaved={() => {
                loadForms();
                setIsCreatingForm(false);
                setSelectedFormId(undefined);
              }}
              onBack={() => {
                setIsCreatingForm(false);
                setSelectedFormId(undefined);
              }}
              onDelete={async (id) => {
                await formService.deleteForm(id);
                loadForms();
              }}
              canEdit={canEdit}
              canDelete={canDelete}
              isLoading={contentLoading}
            />
          )}
          {activeTab === 'buttons' && <ButtonList canEdit={canEdit} />}
          {activeTab === 'leads' && <LeadList canView={canView} />}
          {activeTab === 'team' && <TeamManagement />}
          {activeTab === 'integrations' && <IntegrationSettings canEdit={canEdit} canDelete={canDelete} />}
          {activeTab === 'test' && <TestChatbotView />}
          {activeTab === 'appearance' && (
            <AppearanceView
              canEdit={canEdit}
              isLoading={contentLoading}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView
              canAccessSettings={canAccessSettings}
              isLoading={contentLoading}
            />
          )}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirmation}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}

// Dashboard View Component
function DashboardView({ sliders, sentences }: { sliders: SliderImage[]; sentences: PredefinedSentence[] }) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(() => analyticsService.getDateRange('today'));

  useEffect(() => {
    async function loadMetrics() {
      const data = await analyticsService.getMetrics(dateRange);
      setMetrics(data);

      const stages: FunnelStage[] = [
        {
          name: '1. Total Sessions',
          value: data.totalSessions,
          description: 'User interactions with the platform',
          percentage: 100,
          color: '#3b82f6',
        },
        {
          name: '2. Unique Customers',
          value: data.uniqueCustomers,
          description: 'Distinct individuals who engaged',
          percentage: analyticsService.calculateConversionRate(data.uniqueCustomers, data.totalSessions),
          color: '#8b5cf6',
        },
        {
          name: '3. User Messages Sent',
          value: data.totalUserMessages,
          description: 'Messages sent by customers',
          percentage: Math.round((data.totalUserMessages / data.totalSessions) * 10),
          color: '#f59e0b',
        },
        {
          name: '4. AI Responses Generated',
          value: data.totalAiResponses,
          description: 'Messages generated by AI system',
          percentage: Math.round((data.totalAiResponses / data.totalUserMessages) * 100),
          color: '#06b6d4',
        },
        {
          name: '5. Leads Captured',
          value: data.funnel?.leadsCaptured || 0,
          description: 'Users who submitted forms',
          percentage: analyticsService.calculateConversionRate(data.funnel?.leadsCaptured || 0, data.uniqueCustomers),
          color: '#ec4899',
        },
      ];

      setFunnelStages(stages);
    }

    loadMetrics();
  }, [dateRange]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#f37021] to-[#d85a0a] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
            <p className="text-white/90">Real-time insights into your chatbot performance and user engagement</p>
          </div>
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <StatisticsCards metrics={metrics} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Conversion Funnel</h3>
          <p className="text-sm text-gray-600">
            Track user journey from website visit to lead conversion
          </p>
        </div>
        <FunnelChart stages={funnelStages} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Active Sliders ({sliders.length})</h3>
          <div className="space-y-3">
            {sliders.slice(0, 3).map((slider, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <img src={slider.image_url} alt="" className="w-16 h-10 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{slider.link_url}</p>
                  <p className="text-xs text-gray-500">Order: {slider.order_index}</p>
                </div>
              </div>
            ))}
            {sliders.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No sliders configured</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Replies ({sentences.length})</h3>
          <div className="space-y-3">
            {sentences.slice(0, 4).map((sentence, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-[#f37021] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{sentence.order_index}</span>
                </div>
                <p className="text-sm text-gray-900 flex-1">{sentence.sentence}</p>
              </div>
            ))}
            {sentences.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No quick replies configured</p>
            )}
          </div>
        </div>
      </div>

      {/* Word Cloud Section */}
      <WordCloud
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        maxWords={50}
      />
    </div>
  );
}

// Sliders View Component
function SlidersView({
  sliders,
  addSlider,
  updateSlider,
  removeSlider,
  onSave,
  canEdit,
  canDelete,
  isSaving,
  isLoading,
}: {
  sliders: SliderImage[];
  addSlider: () => void;
  updateSlider: (index: number, field: keyof SliderImage, value: any) => void;
  removeSlider: (index: number) => void;
  onSave: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  isSaving?: boolean;
  isLoading?: boolean;
}) {
  const [uploadingSliderIndex, setUploadingSliderIndex] = useState<number | null>(null);
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<number | null>(null);
  const [imageMeta, setImageMeta] = useState<{ [key: number]: { width: number; height: number; size: number } }>({});

  const { setIsLoading } = useLoading();

  const copyUrl = async (index: number, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrlIndex(index);
      setTimeout(() => setCopiedUrlIndex(null), 1800);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleSliderFileChange = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    if (!canEdit || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        title: 'Warning!',
        text: 'Please select an image file',
        icon: 'warning',
        confirmButtonColor: '#f37021',
      });
      return;
    }

    setUploadingSliderIndex(index);
    setIsLoading(true, 'Uploading image to Cloudinary...');

    try {
      const objectUrl = URL.createObjectURL(file);
      const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = objectUrl;
        img.src = objectUrl;
      });

      const width = imgEl.naturalWidth;
      const height = imgEl.naturalHeight;
      setImageMeta(prev => ({ ...prev, [index]: { width, height, size: file.size } }));
      URL.revokeObjectURL(objectUrl);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/slider', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        if (typeof data.url === 'string' && data.url.startsWith('data:')) {
          throw new Error('Server returned a base64 URL instead of a Cloudinary URL. Please check your Cloudinary configuration on the server.');
        }
        updateSlider(index, 'image_url', data.url);
      } else {
        const errorMsg = data.error || data.detail || 'Failed to upload image';
        Swal.fire({
          title: 'Upload Failed!',
          text: `Upload failed: ${errorMsg}`,
          icon: 'error',
          confirmButtonColor: '#f37021',
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to upload image. Please try again.',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setUploadingSliderIndex(null);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex gap-6">
              <div className="w-40 h-24 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-3">
                <div className="h-10 bg-gray-100 rounded-lg" />
                <div className="h-10 bg-gray-100 rounded-lg" />
                <div className="h-6 w-24 bg-gray-50 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleSave = async () => {
    if (!canEdit) return;
    setIsLoading(true, 'Updating sliders...');
    try {
      await onSave();
      Swal.fire({
        title: 'Success!',
        text: 'Slider settings saved!',
        icon: 'success',
        confirmButtonColor: '#f37021',
      });
    } catch (error) {
      console.error('Sliders save failed:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save sliders. Please try again.',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">Manage promotional slider images displayed in the chatbot</p>
        <button
          onClick={addSlider}
          disabled={!canEdit}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm ${
            canEdit ? 'bg-[#f37021] text-white hover:bg-[#d85a0a]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Slider
        </button>
      </div>

      <div className="space-y-4">
        {sliders.map((slider, index) => {
          const isUploadingSlider = uploadingSliderIndex === index;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-40 h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 relative">
                  {slider.image_url && !isUploadingSlider && (
                    <img
                      src={slider.image_url}
                      alt={`Slider ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {isUploadingSlider && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                      <div className="w-8 h-8 border-4 border-[#f37021] border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-[10px] font-bold text-[#f37021] uppercase tracking-wider">Uploading...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={slider.image_url}
                        onChange={(e) => updateSlider(index, 'image_url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                        disabled={!canEdit}
                      />

                      {slider.image_url && (
                        <div className="mt-1 text-xs flex items-center gap-2">
                          <a
                            href={slider.image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all flex items-center gap-1"
                          >
                            View Link
                          </a>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => copyUrl(index, slider.image_url)}
                            className="text-gray-500 hover:text-[#f37021] flex items-center gap-1 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedUrlIndex === index ? 'Copied!' : 'Copy URL'}
                          </button>
                        </div>
                      )}

                      <label className="flex-shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSliderFileChange(index, e)}
                        />
                        <div className={`px-3 py-2 rounded-lg border border-dashed ${canEdit ? 'border-gray-300 hover:border-[#f37021] cursor-pointer' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}>
                          {isUploadingSlider ? (
                            <span className="text-xs text-[#f37021]">Uploading...</span>
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Link URL</label>
                    <input
                      type="text"
                      value={slider.link_url}
                      onChange={(e) => updateSlider(index, 'link_url', e.target.value)}
                      placeholder="https://example.com/destination"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="text-sm font-semibold text-gray-700">Display Order:</label>
                    <input
                      type="number"
                      value={slider.order_index}
                      onChange={(e) => updateSlider(index, 'order_index', parseInt(e.target.value))}
                      className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeSlider(index)}
                  disabled={!canEdit || !canDelete}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    canEdit && canDelete ? 'text-red-600 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'
                  }`}
                  aria-label="Remove slider"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={!canEdit || !canDelete || isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-semibold shadow-sm ${
            canEdit && canDelete && !isSaving ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Forms View Component
function FormsView({
  forms,
  selectedFormId,
  isCreatingForm,
  onSelectForm,
  onCreateNew,
  onFormSaved,
  onBack,
  onDelete,
  canEdit,
  canDelete,
  isLoading,
}: {
  forms: CustomForm[];
  selectedFormId: string | null;
  isCreatingForm: boolean;
  onSelectForm: (id: string) => void;
  onCreateNew: () => void;
  onFormSaved: () => void;
  onBack: () => void;
  onDelete: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  isLoading?: boolean;
}) {
  const { setIsLoading } = useLoading();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-1/2 bg-gray-100 rounded mb-6" />
            <div className="h-10 w-full bg-gray-50 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  const handleCreateNew = () => {
    if (!canEdit) return;
    onCreateNew();
  };

  if (isCreatingForm || selectedFormId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back to Forms
          </button>
          <h2 className="text-xl font-bold text-gray-900">{selectedFormId ? 'Edit Form' : 'Create New Form'}</h2>
        </div>
        <FormBuilder formId={selectedFormId} onSave={onFormSaved} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">Create and manage custom forms for your chatbot CTA buttons</p>
        <button
          onClick={handleCreateNew}
          disabled={!canEdit}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm ${
            canEdit ? 'bg-[#f37021] text-white hover:bg-[#d85a0a]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          Create New Form
        </button>
      </div>

      {forms.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Forms Yet</h3>
          <p className="text-gray-600 mb-6">Create your first custom form to collect leads and user information</p>
          <button
            onClick={handleCreateNew}
            disabled={!canEdit}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              canEdit ? 'bg-[#f37021] text-white hover:bg-[#d85a0a]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5" />
            Create Your First Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-[#f37021] transition-all p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{form.form_title}</h3>
                  <p className="text-sm text-gray-500">{form.form_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {form.is_active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">Inactive</span>
                  )}
                </div>
              </div>

              {form.form_description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{form.form_description}</p>
              )}

              <div className="flex items-center gap-2 mb-4">
                <button style={{ backgroundColor: form.cta_button_color }} className="px-4 py-2 text-white rounded-lg text-sm font-medium">
                  {form.cta_button_text}
                </button>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onSelectForm(form.id!)}
                  disabled={!canEdit}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                    canEdit ? 'bg-[#f37021] text-white hover:bg-[#d85a0a]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    Swal.fire({
                      title: 'Delete Form?',
                      text: 'Are you sure you want to delete this form? This action cannot be undone.',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#f37021',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Yes, delete it!'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        onDelete(form.id!);
                      }
                    });
                  }}
                  disabled={!canDelete}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    canDelete ? 'border border-red-300 text-red-600 hover:bg-red-50' : 'border bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sentences View Component
function SentencesView({
  sentences,
  addSentence,
  updateSentence,
  removeSentence,
  onSave,
  canEdit,
  canDelete,
  isSaving,
  isLoading,
}: {
  sentences: PredefinedSentence[];
  addSentence: () => void;
  updateSentence: (index: number, value: string) => void;
  removeSentence: (index: number) => void;
  onSave: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  isSaving?: boolean;
  isLoading?: boolean;
}) {
  const { setIsLoading } = useLoading();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">Manage quick reply suggestions for users</p>
        <button
          onClick={addSentence}
          disabled={!canEdit}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm ${
            canEdit ? 'bg-[#f37021] text-white hover:bg-[#d85a0a]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Reply
        </button>
      </div>

      <div className="space-y-3">
        {sentences.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-4 items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#f37021] to-[#d85a0a] rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">{item.order_index}</span>
              </div>
              <input
                type="text"
                value={item.sentence}
                onChange={(e) => canEdit && updateSentence(index, e.target.value)}
                placeholder="Enter quick reply text..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
              />
              <button
                onClick={() => canDelete && removeSentence(index)}
                disabled={!canDelete}
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  canDelete ? 'text-red-600 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Remove sentence"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onSave}
          disabled={!canEdit || isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-semibold shadow-sm ${
            canEdit && !isSaving ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}


// Appearance View Component
function AppearanceView({ canEdit, isLoading }: { canEdit?: boolean; isLoading?: boolean }) {
  const { config, updateConfig } = useChatbotConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);

  useEffect(() => {

    setLocalConfig(config);
  }, [config]);

  const predefinedColors = [
    { name: 'Orange', value: '#f37021' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Teal', value: '#14b8a6' },
  ];

  const { setIsLoading } = useLoading();

  const handleSave = async () => {
    if (!canEdit) return;
    setIsLoading(true, 'Updating appearance settings...');
    setIsSavingAppearance(true);
    try {
      console.log('Saving config:', localConfig);
      await updateConfig(localConfig);
      console.log('Config updated');
      Swal.fire({
        title: 'Success!',
        text: 'Appearance settings saved! Changes will reflect in the chatbot.',
        icon: 'success',
        confirmButtonColor: '#f37021',
      });
    } catch (error) {
      console.error('Appearance save failed:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save appearance settings. Please try again.',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setIsSavingAppearance(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-10 w-full bg-gray-100 rounded" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 w-full bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="h-32 w-full bg-gray-100 rounded-lg mb-4" />
          <div className="h-10 w-full bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Questions Title</label>
        <input
          type="text"
          value={localConfig.quickQuestionsTitle ?? ""}
          onChange={(e) => setLocalConfig({ ...localConfig, quickQuestionsTitle: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
        />
      </div>
      {/* Primary Color Theme Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Primary Color Theme</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose a primary color for chatbot buttons and messages
        </p>

        <div className="space-y-6">
          {/* Predefined Colors */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Preset Colors
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setLocalConfig({ ...localConfig, colorTheme: color.value })}
                  className={`relative group flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${localConfig.colorTheme === color.value
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div
                    className="w-12 h-12 rounded-full shadow-md"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs font-medium text-gray-700">{color.name}</span>
                  {localConfig.colorTheme === color.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom Color
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={localConfig.colorTheme}
                onChange={(e) => setLocalConfig({ ...localConfig, colorTheme: e.target.value })}
                className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localConfig.colorTheme}
                onChange={(e) => setLocalConfig({ ...localConfig, colorTheme: e.target.value })}
                placeholder="#f37021"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent font-mono"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Preview</p>
            <div className="flex gap-3">
              <button
                style={{ backgroundColor: localConfig.colorTheme }}
                className="px-6 py-3 text-white rounded-lg font-medium shadow-sm"
              >
                Chatbot Button
              </button>
              <div
                style={{ backgroundColor: localConfig.colorTheme }}
                className="px-6 py-3 text-white rounded-lg opacity-80"
              >
                Message Bubble
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Color Theme Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Header Color Theme</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose a color for the chatbot window header
        </p>

        <div className="space-y-6">
          {/* Predefined Colors */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Preset Colors
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setLocalConfig({ ...localConfig, headerColorTheme: color.value })}
                  className={`relative group flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${localConfig.headerColorTheme === color.value
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div
                    className="w-12 h-12 rounded-full shadow-md"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs font-medium text-gray-700">{color.name}</span>
                  {localConfig.headerColorTheme === color.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom Color
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={localConfig.headerColorTheme}
                onChange={(e) => setLocalConfig({ ...localConfig, headerColorTheme: e.target.value })}
                className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={localConfig.headerColorTheme}
                onChange={(e) => setLocalConfig({ ...localConfig, headerColorTheme: e.target.value })}
                placeholder="#f37021"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent font-mono"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Preview</p>
            <div className="bg-white rounded-lg overflow-hidden shadow-md max-w-md">
              <div
                style={{ backgroundColor: localConfig.headerColorTheme }}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-white rounded-full"></div>
                <span className="text-white font-semibold">Chatbot</span>
              </div>
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600">Chatbot header with selected color</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Chatbot Logo</h3>
        <p className="text-sm text-gray-600 mb-6">
          Set the logo image that appears in the chatbot header
        </p>

        <div className="space-y-4">
          {/* Upload Image Option */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Logo Image
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validate file size (2MB max)
                    if (file.size > 2 * 1024 * 1024) {
                      Swal.fire({
                        title: 'Warning!',
                        text: 'File size must be less than 2MB',
                        icon: 'warning',
                        confirmButtonColor: '#f37021',
                      });
                      return;
                    }

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      Swal.fire({
                        title: 'Warning!',
                        text: 'Please select an image file',
                        icon: 'warning',
                        confirmButtonColor: '#f37021',
                      });
                      return;
                    }

                    try {
                      setIsLoading(true, 'Uploading logo to Cloudinary...');
                      const formData = new FormData();
                      formData.append('logo', file);

                      const response = await fetch('/api/upload/logo', {
                        method: 'POST',
                        body: formData,
                      });

                      const data = await response.json();

                      if (response.ok && data.url) {
                        if (typeof data.url === 'string' && data.url.startsWith('data:')) {
                          Swal.fire({
                            title: 'Upload Failed!',
                            text: 'Cloudinary returned a data URI; please verify Cloudinary settings in the settings panel and retry.',
                            icon: 'error',
                            confirmButtonColor: '#f37021',
                          });
                        } else {
                          setLocalConfig({ ...localConfig, logoUrl: data.url });
                        }
                      } else {
                        Swal.fire({
                          title: 'Upload Failed!',
                          text: data.error || data.details || 'Failed to upload logo',
                          icon: 'error',
                          confirmButtonColor: '#f37021',
                        });
                      }
                    } catch (error) {
                      console.error('Upload error:', error);
                      Swal.fire({
                        title: 'Error!',
                        text: (error as Error)?.message || 'Failed to upload logo. Please try again.',
                        icon: 'error',
                        confirmButtonColor: '#f37021',
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                />
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#f37021] hover:bg-orange-50 transition-colors cursor-pointer">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Choose Image File</span>
                </div>
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: JPG, PNG, GIF, SVG (Max 2MB)
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* URL Input Option */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo URL or Path
            </label>
            <input
              type="text"
              value={localConfig.logoUrl}
              onChange={(e) => setLocalConfig({ ...localConfig, logoUrl: e.target.value })}
              placeholder="/logo.png or https://example.com/logo.png"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">
              Use a relative path (e.g., /logo.png) or a full URL (e.g., https://example.com/logo.png)
            </p>
          </div>

          {/* Logo Preview */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                {localConfig.logoUrl ? (
                  <img
                    src={localConfig.logoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/FPTSoftware.png';
                    }}
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No logo</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Chatbot</p>
                <p className="text-xs text-gray-500">Virtual Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Icon Type Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Chatbot Icon Button</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose the icon style for the floating chatbot button
        </p>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Icon Style
          </label>

          <div className="grid grid-cols-3 gap-4">
            {/* Default Icon */}
            <div
              onClick={() => setLocalConfig({ ...localConfig, iconType: 'default' })}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${localConfig.iconType === 'default'
                  ? 'border-[#f37021] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  style={{ backgroundColor: localConfig.colorTheme }}
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-md"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Default Icon</span>
              </div>
              {localConfig.iconType === 'default' && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#f37021] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Siri White GIF */}
            <div
              onClick={() => setLocalConfig({ ...localConfig, iconType: 'siriwhite' })}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${localConfig.iconType === 'siriwhite'
                  ? 'border-[#f37021] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md overflow-hidden bg-white">
                  <svg className="w-10 h-10" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="3" fill="#8B5CF6">
                      <animate attributeName="r" values="3;8;3" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="35" cy="50" r="3" fill="#EC4899">
                      <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="65" cy="50" r="3" fill="#06B6D4">
                      <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="25" cy="50" r="2" fill="#F59E0B">
                      <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="75" cy="50" r="2" fill="#10B981">
                      <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Siri White</span>
              </div>
              {localConfig.iconType === 'siriwhite' && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#f37021] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Siri Transparent GIF */}
            <div
              onClick={() => setLocalConfig({ ...localConfig, iconType: 'siritrans' })}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${localConfig.iconType === 'siritrans'
                  ? 'border-[#f37021] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  style={{ background: `linear-gradient(to bottom right, ${localConfig.colorTheme}, #000)` }}
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-md overflow-hidden"
                >
                  <svg className="w-10 h-10" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="3" fill="#FFFFFF">
                      <animate attributeName="r" values="3;8;3" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="35" cy="50" r="3" fill="#FFFFFF">
                      <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="65" cy="50" r="3" fill="#FFFFFF">
                      <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="25" cy="50" r="2" fill="#FFFFFF">
                      <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="75" cy="50" r="2" fill="#FFFFFF">
                      <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Siri Transparent</span>
              </div>
              {localConfig.iconType === 'siritrans' && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#f37021] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> The selected icon will appear as the floating chatbot button on your website.
              Animated GIF icons can make your chatbot more engaging and eye-catching.
            </p>
          </div>
        </div>
      </div>

      {/* Chatbot Name Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Chatbot Name</h3>
        <p className="text-sm text-gray-600 mb-6">
          Set the name that appears in the chatbot header
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chatbot Display Name
            </label>
            <input
              type="text"
              value={localConfig.chatbotName}
              onChange={(e) => setLocalConfig({ ...localConfig, chatbotName: e.target.value })}
              placeholder="FPT AI Assistant"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">
              This name will appear at the top of the chat window
            </p>
          </div>

          {/* Preview */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Preview</p>
            <div className="bg-white rounded-lg overflow-hidden shadow-md max-w-md">
              <div
                style={{ backgroundColor: localConfig.headerColorTheme }}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                  <img
                    src={localConfig.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/FPTSoftware.png';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">
                    {localConfig.chatbotName || 'FPT AI Assistant'}
                  </h3>
                  <p className="text-white/80 text-xs">Online</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600">Chatbot header with selected name</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Messages</h3>
        <p className="text-sm text-gray-600 mb-6">
          Customize the messages displayed to users
        </p>

        <div className="space-y-6">
          {/* Trigger Message (Tooltip) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tooltip Trigger Message
            </label>
            <textarea
              value={localConfig.triggerMessage}
              onChange={(e) => setLocalConfig({ ...localConfig, triggerMessage: e.target.value })}
              rows={2}
              placeholder="Hi there! How can I help you today?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent resize-none"
            />
            <p className="mt-2 text-xs text-gray-500">
              This message appears in the tooltip when hovering over the chatbot icon
            </p>
          </div>

          {/* Bot Greeting Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bot Greeting Message
            </label>
            <textarea
              value={localConfig.botGreetingMessage}
              onChange={(e) => setLocalConfig({ ...localConfig, botGreetingMessage: e.target.value })}
              rows={3}
              placeholder="Hello! I'm your AI assistant. How can I help you today?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent resize-none"
            />
            <p className="mt-2 text-xs text-gray-500">
              This message is sent by the bot when the user clicks "Continue with AI"
            </p>
          </div>

          {/* Temporary Popup Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Temporary Popup Title
            </label>
            <input
              type="text"
              value={localConfig.popupTitle}
              onChange={(e) => setLocalConfig({ ...localConfig, popupTitle: e.target.value })}
              placeholder="Need help? 👋🏻"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">
              This is the main title shown in the temporary popup message that appears near the chatbot icon
            </p>
          </div>

          {/* Temporary Popup Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Temporary Popup Description
            </label>
            <input
              type="text"
              value={localConfig.popupDescription}
              onChange={(e) => setLocalConfig({ ...localConfig, popupDescription: e.target.value })}
              placeholder="I've got you covered!"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">
              This is the subtitle/description shown below the title in the temporary popup
            </p>
          </div>

          {/* Messages Preview */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-4">Preview</p>

            {/* Tooltip Preview */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Tooltip Message:</p>
              <div className="inline-block px-4 py-2 bg-black text-white text-sm rounded-lg">
                {localConfig.triggerMessage || 'Hi there! How can I help you today?'}
              </div>
            </div>

            {/* Bot Message Preview */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Bot Greeting Message:</p>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
                <div
                  style={{ backgroundColor: localConfig.colorTheme }}
                  className="px-4 py-3 rounded-2xl rounded-tl-none text-white max-w-xs shadow-sm"
                >
                  {localConfig.botGreetingMessage || "Hello! I'm your AI assistant. How can I help you today?"}
                </div>
              </div>
            </div>

            {/* Temporary Popup Preview */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Temporary Popup Message:</p>
              <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-2xl shadow-md px-4 py-3">
                <img
                  src={localConfig.logoUrl || '/FPTSoftware.png'}
                  alt="Bot"
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/FPTSoftware.png';
                  }}
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {localConfig.popupTitle || 'Need help? 👋🏻'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {localConfig.popupDescription || "I've got you covered!"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Window Configuration - HIDDEN */}
      {false && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sources Window</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure the width of the sources panel that appears alongside the chat on larger screens
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sources Panel Width (pixels)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="200"
                  max="500"
                  value={localConfig.sourcesWidth}
                  onChange={(e) => setLocalConfig({ ...localConfig, sourcesWidth: parseInt(e.target.value) || 300 })}
                  className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent text-center"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Recommended range: 200-500 pixels. The sources panel shows reference links alongside chat messages.
              </p>
            </div>

            {/* Preview */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-4">Layout Preview</p>
              <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-300" style={{ width: '100%', height: '200px' }}>
                <div className="flex h-full">
                  {/* Main Chat Area */}
                  <div className="flex-1 bg-white border-r border-gray-200 p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-2">Chat Messages</div>
                      <div className="space-y-2">
                        <div className="bg-gray-100 p-2 rounded text-xs">Bot: Hello! How can I help?</div>
                        <div className="bg-orange-100 p-2 rounded text-xs ml-4">User: Tell me about your services</div>
                      </div>
                    </div>
                    <div className="mt-2 p-2 border border-gray-300 rounded text-xs text-gray-400">
                      Type your message...
                    </div>
                  </div>

                  {/* Sources Panel */}
                  <div
                    className="bg-gray-50 border-l border-gray-200 p-4"
                    style={{
                      width: `${Math.min(localConfig.sourcesWidth, 150)}px`, // Scale down for preview
                      minWidth: '80px'
                    }}
                  >
                    <div className="text-xs font-semibold text-gray-700 mb-2">Sources</div>
                    <div className="bg-white p-2 rounded border text-xs">
                      <div className="font-medium">Reference 1</div>
                      <div className="text-gray-500 text-[10px] truncate">example.com/page</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                <strong>Current width:</strong> {localConfig.sourcesWidth}px -
                {localConfig.sourcesWidth < 250 ? ' Compact' : localConfig.sourcesWidth > 400 ? ' Spacious' : ' Balanced'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={!canEdit || isSavingAppearance}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-semibold shadow-sm ${
            canEdit && !isSavingAppearance ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-5 h-5" />
          {isSavingAppearance ? 'Saving...' : 'Save Appearance Settings'}
        </button>
      </div>
    </div>
  );
}

// Settings View Component
function SettingsView({ canAccessSettings, isLoading }: { canAccessSettings?: boolean; isLoading?: boolean }) {
  const { setIsLoading } = useLoading();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="h-10 w-full bg-gray-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="h-32 w-full bg-gray-100 rounded-lg mb-4" />
          <div className="h-20 w-full bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!canAccessSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">You do not have permission to access settings.</div>
      </div>
    );
  }
  const { config, updateConfig } = useChatbotConfig();
  const { user } = useTenant();
  const [localConfig, setLocalConfig] = useState(config);
  const [buttons, setButtons] = useState<Array<{ id: string; label: string }>>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [configKey, setConfigKey] = useState<ConfigKeyData | null>(null);
  const [keyGenerating, setKeyGenerating] = useState(false);
  const [chatbotVisibility, setChatbotVisibility] = useState<{ mode: 'always_show' | 'hide_on_urls' | 'show_only_on_urls'; url_list: string[] }>({
    mode: 'always_show',
    url_list: []
  });
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const [cloudinaryConfig, setCloudinaryConfig] = useState({ url: '', cloud_name: '', api_key: '', api_secret: '' });
  const [cloudinarySaving, setCloudinarySaving] = useState(false);

  useEffect(() => {
    loadButtons();
    loadConfigKey();
  }, []);

  const loadButtons = async () => {
    try {
      const buttonList = await buttonService.getAllButtons();
      console.log('Loaded buttons for auto-trigger:', buttonList);
      setButtons(buttonList.map(b => ({ id: b.id, label: b.label })));
    } catch (error) {
      console.error('Failed to load buttons:', error);
    }
  };
  useEffect(() => {
    async function fetchConfig() {
      const apiConfig = await ConfigService.getConfig();
      console.log('Fetched config from API:', apiConfig);
      setLocalConfig(apiConfig);
    }
    fetchConfig();
  }, []);

  useEffect(() => {
    async function loadVisibility() {
      try {
        setVisibilityLoading(true);

        const sys = await SystemSettingsService.getSettings();
        if (sys && (sys as any).chatbot_visibility) {
          setChatbotVisibility((sys as any).chatbot_visibility);
        }

        if (sys && (sys as any).cloudinary) {
          // Keep backward compatibility: only used if user-specific is not set
          setCloudinaryConfig(sanitizeCloudinaryConfig((sys as any).cloudinary));
        }

        if (user?.id) {
          try {
            const teamMember = await TeamService.getTeamMemberById(user.id);
            if (teamMember.data?.cloudinary) {
              setCloudinaryConfig(sanitizeCloudinaryConfig(teamMember.data.cloudinary));
            }
          } catch (userCloudErr) {
            console.warn('Could not load user Cloudinary settings:', userCloudErr);
          }
        }
      } catch (err) {
        console.warn('Could not load system settings for visibility:', err);
      } finally {
        setVisibilityLoading(false);
      }
    }
    loadVisibility();
  }, [user]);

  const handleSaveVisibility = async () => {
    try {
      setVisibilityLoading(true);
      await SystemSettingsService.updateSettings({ chatbot_visibility: chatbotVisibility } as any);
      Swal.fire({
        title: 'Success!',
        text: 'Chatbot visibility saved successfully!',
        icon: 'success',
        confirmButtonColor: '#f37021',
      });
    } catch (err) {
      console.error('Failed to save chatbot visibility:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save chatbot visibility.',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setVisibilityLoading(false);
    }
  };

  const sanitizeCloudinaryConfig = (config: typeof cloudinaryConfig) => {
    let { url, cloud_name, api_key, api_secret } = config;
    url = url?.trim() || '';
    if (url.startsWith('CLOUDINARY_URL=')) {
      url = url.substring('CLOUDINARY_URL='.length).trim();
    }
    if (url.startsWith('"') && url.endsWith('"')) {
      url = url.slice(1, -1).trim();
    }

    if (!cloud_name && url.startsWith('cloudinary://')) {
      const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        api_key = api_key || match[1];
        api_secret = api_secret || match[2];
        cloud_name = cloud_name || match[3];
      }
    }

    return { url, cloud_name, api_key, api_secret };
  };

  const handleSaveCloudinary = async () => {
    if (!user?.id) {
      Swal.fire({
        title: 'Error!',
        text: 'User not authenticated. Please login and try again.',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
      return;
    }

    const normalizedCloudinaryConfig = sanitizeCloudinaryConfig(cloudinaryConfig);

    setCloudinarySaving(true);
    try {
      const result = await TeamService.updateTeamMember(user.id, { cloudinary: normalizedCloudinaryConfig });
      if (result.error) {
        console.error('Failed to save Cloudinary settings:', result.error);
        Swal.fire({
          title: 'Error!',
          text: result.error.message || 'Failed to save Cloudinary settings. Please try again.',
          icon: 'error',
          confirmButtonColor: '#f37021',
        });
        return;
      }
      Swal.fire({
        title: 'Success!',
        text: 'Cloudinary settings saved to your profile successfully!',
        icon: 'success',
        confirmButtonColor: '#f37021',
      });
    } catch (err) {
      console.error('Failed to save Cloudinary settings:', err);
      Swal.fire({
        title: 'Error!',
        text: (err as Error)?.message || 'Failed to save Cloudinary settings. Please try again.',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setCloudinarySaving(false);
    }
  };

  // const handleCancelVisibility = async () => {
  //   try {
  //     setVisibilityLoading(true);
  //     const sys = await SystemSettingsService.getSettings();
  //     if (sys && (sys as any).chatbot_visibility) setChatbotVisibility((sys as any).chatbot_visibility);
  //   } catch (err) {
  //     console.warn('Failed to reload visibility settings:', err);
  //   } finally {
  //     setVisibilityLoading(false);
  //   }
  // };
  
  const loadConfigKey = async () => {
    try {
      const keyData = await ConfigKeyService.getCurrentKey();
      setConfigKey(keyData);
    } catch (error) {
      console.error('Failed to load config key:', error);
    }
  };

  const generateNewConfigKey = async () => {
    try {
      setKeyGenerating(true);
      const newKeyData = await ConfigKeyService.generateNewKey();
      setConfigKey(newKeyData);
      Swal.fire({
        title: 'Success!',
        text: 'New config key generated successfully!',
        icon: 'success',
        confirmButtonColor: '#f37021',
      });
    } catch (error) {
      console.error('Failed to generate config key:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to generate config key. Please try again.',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setKeyGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!canAccessSettings) return;
    setIsLoading(true, 'Updating chatbot settings...');
    setIsSavingSettings(true);
    try {
      console.log('Saving configuration:', localConfig);
      await updateConfig(localConfig);
      Swal.fire({
        title: 'Success!',
        text: 'Settings saved successfully!',
        icon: 'success',
        confirmButtonColor: '#f37021',
      });
    } catch (error) {
      console.error('Settings save failed:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save settings. Please try again.',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setIsSavingSettings(false);
      setIsLoading(false);
    }
  };

  const generateEmbedCode = () => {
    const currentUrl = window.location.origin;
    if (!configKey) {
      return `<!-- Please generate a Config Key first to get the embed code -->`;
    }

    return `<!-- FleziMate Chatbot Embed Code -->
    <script src="${currentUrl}/chatbot-widget-v2.js"></script>
      <script>
        (function() {
          FPTChatbot.init({
          configKey: '${configKey.configKey}',
          url: '${currentUrl}',
          position: 'bottom-right'
        });
        })();
      </script>`;
  };

    // Default Country Section as a separate component to keep UI modular
    function DefaultCountrySection({ localConfig, setLocalConfig }: { localConfig: any; setLocalConfig: any }) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Default Country</h3>
          <p className="text-sm text-gray-600 mb-4">Select the default country that will be used in chatbot widget.</p>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Country</label>

            <select
              value={localConfig?.defaultCountryName || ''}
              onChange={(e) => {
                const next = { ...(localConfig || {}), defaultCountryName: e.target.value };
                setLocalConfig(next);
                try {
                  updateConfig(next);
                } catch (err) {
                  // ignore update errors here; user can still click Save
                }
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
            >
              <option value="">-- Select a country --</option>
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-gray-500">Pick a country from the dropdown. The selected value will be saved to the chatbot configuration.</p>
          </div>
        </div>
      );
    }

  const copyEmbedCode = () => {
    const code = generateEmbedCode();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Config Key Management Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border-2 border-blue-200 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Chatbot Configuration Key</h3>
            <p className="text-sm text-gray-600">
              Generate a unique key to secure your chatbot configuration and embed code
            </p>
          </div>
        </div>

        {configKey ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">Current Config Key:</h4>
                <span className="text-xs text-gray-500">
                  Generated: {new Date(configKey.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="bg-gray-100 rounded p-3 font-mono text-sm break-all">
                {configKey.configKey}
              </div>
            </div>
            <button
              onClick={generateNewConfigKey}
              disabled={keyGenerating || !canAccessSettings}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                canAccessSettings ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {keyGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Generate New Key
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">No configuration key found. Generate one to enable chatbot embedding.</p>
            <button
              onClick={generateNewConfigKey}
              disabled={keyGenerating || !canAccessSettings}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium mx-auto ${
                canAccessSettings ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {keyGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Generate Config Key
                </>
              )}
            </button>
          </div>
        )}

      

        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600">🔐</span>
            Security Information:
          </h4>
          <ul className="text-sm text-gray-700 space-y-1.5 ml-6 list-disc">
            <li>Your config key is used to fetch chatbot settings and theme details securely</li>
            <li>Each key is unique and tied to your chatbot configuration</li>
            <li>Generating a new key will invalidate the previous one</li>
            <li>Keep your config key secure - anyone with this key can access your chatbot settings</li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-sm border-2 border-orange-200 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Code className="w-6 h-6 text-[#f37021]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Embed Chatbot on Your Website</h3>
            <p className="text-sm text-gray-600">
              Copy and paste this code snippet into your website's HTML to integrate the chatbot
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 relative">
          <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-words">
            {generateEmbedCode()}
          </pre>
          <button
            onClick={copyEmbedCode}
            className="absolute top-3 right-3 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Code
              </>
            )}
          </button>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-orange-600">📋</span>
            Installation Instructions:
          </h4>
          <ol className="text-sm text-gray-700 space-y-2 ml-6 list-decimal">
            <li>Copy the embed code above by clicking the "Copy Code" button</li>
            <li>Paste the code into your website's HTML, just before the closing <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">&lt;/body&gt;</code> tag</li>
            <li>Save and publish your website</li>
            <li>The chatbot will appear as an icon in the bottom-right corner of your pages</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Pro Tips:</h4>
          <ul className="text-sm text-gray-700 space-y-1.5 ml-6 list-disc">
            <li>You can customize the chatbot's appearance in the "Appearance" section</li>
            <li>All configuration changes will automatically apply to embedded chatbots</li>
            <li>The chatbot works on all modern browsers and is mobile-responsive</li>
            <li>Analytics and lead tracking work seamlessly with embedded chatbots</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Cloudinary Image Upload Configuration</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add your Cloudinary values in the fields below. These values are saved in your portal settings and used by image upload endpoints.
        </p>

        <div className="space-y-4">         
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CLOUDINARY_URL</label>
            <input
              type="text"
              value={cloudinaryConfig.url}
              onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, url: e.target.value })}
              placeholder="cloudinary://<api_key>:<api_secret>@<cloud_name>"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent font-mono text-sm"
              disabled={!canAccessSettings}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CLOUDINARY_CLOUD_NAME</label>
            <input
              type="text"
              value={cloudinaryConfig.cloud_name}
              onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, cloud_name: e.target.value })}
              placeholder="your_cloud_name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent font-mono text-sm"
              disabled={!canAccessSettings}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CLOUDINARY_API_KEY</label>
            <input
              type="text"
              value={cloudinaryConfig.api_key}
              onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, api_key: e.target.value })}
              placeholder="your_api_key"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent font-mono text-sm"
              disabled={!canAccessSettings}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CLOUDINARY_API_SECRET</label>
            <input
              type="password"
              value={cloudinaryConfig.api_secret}
              onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, api_secret: e.target.value })}
              placeholder="your_api_secret"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent font-mono text-sm"
              disabled={!canAccessSettings}
            />
          </div>

          <p className="text-xs text-gray-500">
            Find these values in your Cloudinary dashboard under Account Settings &gt; API keys. Use the same values as in existing env vars CLOUDINARY_URL and CLOUDINARY_CLOUD_NAME.
          </p>

          <button
            type="button"
            onClick={handleSaveCloudinary}
            disabled={!canAccessSettings || cloudinarySaving}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${canAccessSettings ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {cloudinarySaving ? 'Saving...' : 'Save Cloudinary Settings'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Direct Line Configuration</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure the Direct Line token endpoint for bot communication
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Token Endpoint URL
            </label>
            <input
              type="text"
              value={localConfig.tokenEndpoint}
              onChange={(e) => setLocalConfig({ ...localConfig, tokenEndpoint: e.target.value })}
              placeholder="https://directline.botframework.com/v3/directline/tokens/generate"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent font-mono text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">
              Enter the Direct Line token endpoint URL for your bot. This is where the chatbot will fetch authentication tokens.
            </p>
          </div>

          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-amber-600">⚠️</span>
              Important Information:
            </h4>
            <ul className="text-sm text-gray-700 space-y-1.5 ml-6 list-disc">
              <li>This endpoint is used to generate tokens for Direct Line communication</li>
              <li>Common formats:
                <ul className="ml-4 mt-1 space-y-1 text-xs">
                  <li>• Azure Bot Service: <code className="bg-white px-1 py-0.5 rounded">https://directline.botframework.com/v3/directline/tokens/generate</code></li>
                  <li>• Power Virtual Agents: <code className="bg-white px-1 py-0.5 rounded">https://[region].botframework.com/powervirtualagents/.../token</code></li>
                </ul>
              </li>
              <li>Changes take effect on the next chat session initialization</li>
              <li>Ensure the endpoint is accessible and properly configured</li>
            </ul>
          </div>
        </div>
      </div>

        {/* Chatbot Visibility Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Chatbot Visibility</h3>
        <p className="text-sm text-gray-600 mb-4">Control when the chatbot appears on your website using visibility rules. Use one pattern per line. Use * for wildcards (e.g. https://example.com/products/*).</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
            <select
              value={chatbotVisibility.mode}
              onChange={(e) => setChatbotVisibility({ ...chatbotVisibility, mode: e.target.value as any })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
              disabled={!canAccessSettings}
            >
              <option value="always_show">Always show</option>
              <option value="hide_on_urls">Hide on specific URLs</option>
              <option value="show_only_on_urls">Show only on specific URLs</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">URL Patterns</label>
            <div className="space-y-2">
              {chatbotVisibility.url_list.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const next = [...chatbotVisibility.url_list];
                      next[idx] = e.target.value;
                      setChatbotVisibility({ ...chatbotVisibility, url_list: next });
                    }}
                    placeholder="https://example.com/path or use * for wildcards"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent font-mono text-sm"
                    disabled={!canAccessSettings}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = chatbotVisibility.url_list.filter((_, i) => i !== idx);
                      setChatbotVisibility({ ...chatbotVisibility, url_list: next });
                    }}
                    disabled={!canAccessSettings}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm"
                    aria-label={`Remove URL ${idx + 1}`}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div>
                <button
                  type="button"
                  onClick={() => setChatbotVisibility({ ...chatbotVisibility, url_list: [...chatbotVisibility.url_list, ''] })}
                  disabled={!canAccessSettings}
                  className={`px-3 py-2 rounded-lg text-sm ${canAccessSettings ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  Add URL
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Add one URL per entry. Patterns support simple wildcard '*' for prefix/suffix matching.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveVisibility}
              disabled={!canAccessSettings || visibilityLoading}
              className={`px-4 py-2 rounded-lg font-medium ${canAccessSettings ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              Save Visibility
            </button>
            {/* <button
              onClick={handleCancelVisibility}
              disabled={visibilityLoading}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700"
            >
              Cancel
            </button> */}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Language & Locale Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure the language and locale for the chatbot conversation
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <input
              type="checkbox"
              id="autoDetectLocale"
              checked={localConfig.autoDetectLocale}
              onChange={(e) => setLocalConfig({ ...localConfig, autoDetectLocale: e.target.checked })}
              className="mt-1 w-5 h-5 text-[#f37021] focus:ring-[#f37021] border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="autoDetectLocale" className="text-sm font-semibold text-gray-900 cursor-pointer">
                Auto-detect user's browser locale
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Automatically detect and use the user's browser language setting when initializing the chat
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Default Locale
            </label>
            <select
              value={localConfig.locale}
              onChange={(e) => setLocalConfig({ ...localConfig, locale: e.target.value as any })}
              disabled={localConfig.autoDetectLocale}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="en-US">🇺🇸 English (US)</option>
              <option value="en-GB">🇬🇧 English (UK)</option>
              <option value="es-ES">🇪🇸 Spanish (Español)</option>
              <option value="fr-FR">🇫🇷 French (Français)</option>
              <option value="de-DE">🇩🇪 German (Deutsch)</option>
              <option value="it-IT">🇮🇹 Italian (Italiano)</option>
              <option value="pt-BR">🇧🇷 Portuguese (Português)</option>
              <option value="ja-JP">🇯🇵 Japanese (日本語)</option>
              <option value="zh-CN">🇨🇳 Chinese Simplified (简体中文)</option>
              <option value="zh-TW">🇹🇼 Chinese Traditional (繁體中文)</option>
              <option value="ko-KR">🇰🇷 Korean (한국어)</option>
              <option value="ar-SA">🇸🇦 Arabic (العربية)</option>
              <option value="ru-RU">🇷🇺 Russian (Русский)</option>
              <option value="vi-VN">🇻🇳 Vietnamese (Tiếng Việt)</option>
              <option value="th-TH">🇹🇭 Thai (ไทย)</option>
              <option value="id-ID">🇮🇩 Indonesian (Bahasa Indonesia)</option>
              <option value="hi-IN">🇮🇳 Hindi (हिन्दी)</option>
              <option value="nl-NL">🇳🇱 Dutch (Nederlands)</option>
              <option value="pl-PL">🇵🇱 Polish (Polski)</option>
              <option value="tr-TR">🇹🇷 Turkish (Türkçe)</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {localConfig.autoDetectLocale
                ? 'This locale will be used as a fallback if browser locale detection fails'
                : 'This locale will be used for all chat conversations'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">How it works:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#f37021] font-bold">1.</span>
                <span>The locale is sent to the bot when the chat session is initialized</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f37021] font-bold">2.</span>
                <span>The bot uses this information to provide responses in the appropriate language</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f37021] font-bold">3.</span>
                <span>All messages include the locale information for consistent multilingual support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Auto-Trigger Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Automatically show a button after every N bot responses to encourage user engagement
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <input
              type="checkbox"
              id="autoTriggerEnabled"
              checked={localConfig.autoTriggerEnabled}
              onChange={(e) => setLocalConfig({ ...localConfig, autoTriggerEnabled: e.target.checked })}
              className="mt-1 w-5 h-5 text-[#f37021] focus:ring-[#f37021] border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="autoTriggerEnabled" className="text-sm font-semibold text-gray-900 cursor-pointer">
                Enable automatic button triggers in chat
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Show a button automatically after a set number of bot responses
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Trigger After Bot Responses
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={localConfig.autoTriggerCount}
              onChange={(e) => setLocalConfig({ ...localConfig, autoTriggerCount: parseInt(e.target.value) || 1 })}
              disabled={!localConfig.autoTriggerEnabled}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="3"
            />
            <p className="mt-2 text-xs text-gray-500">
              The button will appear after every {localConfig.autoTriggerCount} bot {localConfig.autoTriggerCount === 1 ? 'response' : 'responses'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Connected Button Action
            </label>
            <select
              value={localConfig.autoTriggerButtonId || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, autoTriggerButtonId: e.target.value || null })}
              disabled={!localConfig.autoTriggerEnabled}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a button action...</option>
              {buttons.map(button => (
                <option key={button.id} value={button.id}>
                  {button.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {localConfig.autoTriggerButtonId
                ? 'The selected button action will be triggered when users click "Get a Quote"'
                : 'Select which button action to trigger when users click the automated button'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">How it works:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#f37021] font-bold">1.</span>
                <span>The system counts bot responses during the conversation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f37021] font-bold">2.</span>
                <span>After every {localConfig.autoTriggerCount} {localConfig.autoTriggerCount === 1 ? 'response' : 'responses'}, an automated message appears with a "Get a Quote" button</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f37021] font-bold">3.</span>
                <span>When clicked, the button executes the connected action (form, redirect, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f37021] font-bold">4.</span>
                <span>This helps capture leads and drive conversions during natural conversation flow</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* <DefaultCountrySection localConfig={localConfig} setLocalConfig={setLocalConfig} /> */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">General Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chatbot Name
            </label>
            <input
              type="text"
              defaultValue="ChatBot"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bot Response Delay (ms)
            </label>
            <input
              type="number"
              defaultValue="1000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="enableNotifications"
              defaultChecked
              className="w-5 h-5 text-[#f37021] focus:ring-[#f37021] border-gray-300 rounded"
            />
            <label htmlFor="enableNotifications" className="text-sm font-medium text-gray-700">
              Enable push notifications
            </label>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="enableAnalytics"
              defaultChecked
              className="w-5 h-5 text-[#f37021] focus:ring-[#f37021] border-gray-300 rounded"
            />
            <label htmlFor="enableAnalytics" className="text-sm font-medium text-gray-700">
              Enable analytics tracking
            </label>
          </div>
        </div>
      </div>

        <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!canAccessSettings || isSavingSettings}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-semibold shadow-sm ${
            canAccessSettings && !isSavingSettings ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-5 h-5" />
          {isSavingSettings ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function TestChatbotView() {
  const { config } = useChatbotConfig();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#f37021] to-[#d85a0a] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Test Chatbot</h2>
            <p className="text-white/90">Test your chatbot configuration and interactions in real-time</p>
          </div>
          <MessageSquare className="w-12 h-12 text-white/50" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Live Chatbot Preview</h3>
          <p className="text-sm text-gray-600 mb-4">
            The chatbot below uses your current configuration settings. Test all features including forms, buttons, and AI responses.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Live Configuration
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Real-time Testing
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 min-h-[600px] relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Click the chatbot icon in the bottom right to start testing</p>
            </div>
          </div>
          <Chatbot />
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-blue-600">📂</span>
                Sources Window Status
              </h4>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Sources Panel Width:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{config.sourcesWidth}px</span>
                </div>
                <div className="text-[10px] text-gray-600 space-y-1">
                  <div>• Visible only on desktop screens (≥1024px wide)</div>
                  <div>• Shows reference links from bot responses with sources</div>
                  <div>• Width is set to {config.sourcesWidth}px (default configuration)</div>
                </div>
              </div>
              <p className="text-[10px] text-blue-600 mt-2">
                <strong>Tip:</strong> Send messages to the AI to see sources appear in the right panel.
                Ensure your screen is wide enough (desktop) to see the sources window.
              </p>
              {/* Test Sources Window Button */}
              <div className="mt-3">
                <button
                  onClick={() => {
                    const message = 'Test message with sources to verify sources window display';
                    Swal.fire({
                      title: 'Testing Sources Window',
                      text: `Testing sources window functionality:\n\n${message}\n\nThis would inject a test message with mock sources into the chatbot UI to verify that the sources window appears correctly with the configured width of ${config.sourcesWidth}px.`,
                      icon: 'info',
                      confirmButtonColor: '#3b82f6',
                    });
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium transition-colors"
                >
                  Test Sources Window
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Test Features
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Quick reply buttons</li>
              <li>• Custom forms</li>
              <li>• Button actions</li>
              <li>• AI responses</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Visual Testing
            </h4>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• Color themes</li>
              <li>• Logo display</li>
              <li>• Icon animations</li>
              <li>• Message styling</li>
              <li>• Sources window width</li>
            </ul>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics Tracking
            </h4>
            <ul className="text-xs text-orange-800 space-y-1">
              <li>• Session tracking</li>
              <li>• Message counting</li>
              <li>• Lead capture</li>
              <li>• User engagement</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Testing Tips</h4>
              <ul className="text-xs text-yellow-800 space-y-1.5 ml-6 list-disc">
                <li>• Changes made in other sections will automatically apply here</li>
                <li>• Test on different screen sizes to ensure responsiveness</li>
                <li>• Try all button actions and form submissions</li>
                <li>• Check that analytics are being recorded in the Dashboard</li>
                <li>• Sources panel only appears on desktop screens (≥1024px width)</li>
                <li>• Send AI messages to see sources populate in the right panel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
