import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  PlusCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Drawer } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import OrdersList from './components/OrderList';
import OrderDetails from './components/OrderDetails';
import CreateOrder from './components/CreateOrder';
import EditOrder from './components/EditOrder';
import './App.css';

const { Header, Sider, Content } = Layout;

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const { token: { colorBgContainer } } = theme.useToken();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location]);

  const menuItems = [
    {
      key: '1',
      icon: <ShoppingOutlined className="app-menu-icon" />,
      label: <Link to="/" className="app-menu-item">Accueil</Link>,
    },
    {
      key: '2',
      icon: <PlusCircleOutlined className="app-menu-icon" />,
      label: <Link to="/orders/create" className="app-menu-item">Nouvelle Commande</Link>,
    },
  ];

  const getSelectedKey = () => {
    if (location.pathname === '/') return ['1'];
    if (location.pathname.includes('/orders/create')) return ['2'];
    return ['1'];
  };

  const SidebarContent = () => (
    <>
      <div className="app-sidebar-logo">
        <Link to="/" onClick={() => isMobile && setMobileDrawerOpen(false)}>
          <img 
            src="https://cdn.prod.website-files.com/63871f00927399e4cedac3cf/65b12937c519e11c85924723_logo_djoli_icon%402x.png" 
            alt="Logo Djoli"
          />
        </Link>
      </div>
      
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={getSelectedKey()}
        items={menuItems}
        className="app-sidebar-menu"
      />
    </>
  );

  return (
    <Layout className="app-layout">
      {/* Sidebar ordinateur */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          breakpoint="lg"
          className="app-sidebar"
          width={240}
        >
          <SidebarContent />
        </Sider>
      )}

      {/* Drawer mobile */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          closable={false}
          width={280}
          bodyStyle={{ padding: 0, backgroundColor: '#ffffff' }}
        >
          <div className="app-drawer-header">
            <h3 className="app-drawer-title">Menu</h3>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setMobileDrawerOpen(false)}
              className="app-drawer-close-button"
            />
          </div>
          <SidebarContent />
        </Drawer>
      )}

      <Layout>
        <Header
          className={`app-header ${
            isMobile ? 'app-header-mobile' : 'app-header-desktop'
          }`}
          style={{ background: colorBgContainer }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => {
              if (isMobile) {
                setMobileDrawerOpen(true);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="app-menu-button"
          />
          
          <Link to="/" className="app-header-logo">
            <h1 className={`${isMobile ? 'app-header-logo-mobile' : 'app-header-logo-desktop'}`}>
              Djoli
            </h1>
          </Link>
          
          <div className={`app-header-badge ${
            isMobile ? 'app-header-badge-mobile' : 'app-header-badge-desktop'
          }`}>
            {isMobile ? 'Commandes' : 'Système de Commande'}
          </div>
        </Header>

        <Content className="app-content">
          <Routes>
            <Route path="/" element={<OrdersList />} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/orders/create" element={<CreateOrder />} />
            <Route path="/orders/edit/:id" element={<EditOrder />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;