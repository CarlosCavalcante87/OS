import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Kanban, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  UserCheck, 
  Package, 
  Wrench, 
  Settings,
  ChevronRight
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard' 
  | 'os_list' 
  | 'kanban' 
  | 'vendas' 
  | 'financeiro' 
  | 'clientes' 
  | 'tecnicos' 
  | 'estoque' 
  | 'servicos' 
  | 'configuracoes';

interface SidebarMenuProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  osBadgeCount: number;
  estoqueBaixoCount: number;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  activeTab,
  onTabChange,
  osBadgeCount,
  estoqueBaixoCount
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Visão Geral',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'os_list' as ActiveTab,
      label: 'Ordens de Serviço',
      icon: FileText,
      badge: osBadgeCount > 0 ? osBadgeCount : null,
      badgeColor: 'bg-indigo-500'
    },
    {
      id: 'kanban' as ActiveTab,
      label: 'Quadro Kanban',
      icon: Kanban,
      badge: null
    },
    {
      id: 'vendas' as ActiveTab,
      label: 'Vendas & PDV',
      icon: ShoppingCart,
      badge: null
    },
    {
      id: 'financeiro' as ActiveTab,
      label: 'Financeiro',
      icon: DollarSign,
      badge: null
    },
    {
      id: 'clientes' as ActiveTab,
      label: 'Clientes',
      icon: Users,
      badge: null
    },
    {
      id: 'tecnicos' as ActiveTab,
      label: 'Técnicos',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'estoque' as ActiveTab,
      label: 'Estoque de Peças',
      icon: Package,
      badge: estoqueBaixoCount > 0 ? estoqueBaixoCount : null,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'servicos' as ActiveTab,
      label: 'Serviços & Mão de Obra',
      icon: Wrench,
      badge: null
    },
    {
      id: 'configuracoes' as ActiveTab,
      label: 'Empresa & Termos',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 p-3 lg:p-4 flex lg:flex-col justify-between overflow-x-auto lg:overflow-x-visible">
      <div className="flex lg:flex-col gap-1 w-full">
        <div className="hidden lg:block px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap lg:whitespace-normal ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${
                      item.badgeColor || 'bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 hidden lg:block opacity-70" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="hidden lg:block pt-4 border-t border-slate-800/80">
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300">Banco Conectado</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Firebase Firestore Real-Time</p>
        </div>
      </div>
    </aside>
  );
};
