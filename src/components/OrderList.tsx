import React, { useEffect, useState } from 'react';
import { Table, Button, message, Tag, Space, Card } from 'antd';
import { 
  ShoppingCartOutlined, 
  EyeOutlined, 
  PlusOutlined, 
  PhoneOutlined, 
  UserOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/OrderList.css';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  img: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  total: number;
  items: OrderItem[];
  created_at?: string;
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  
  const API_URL ='http://localhost:8000/api';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      message.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (orderId: number) => {
    navigate(`/order/${orderId}`);
  };

  const columns = [
    {
      title: 'N° Commande',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: number) => (
        <Tag color="blue" className="order-list-tag">
          #{id.toString().padStart(4, '0')}
        </Tag>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (name: string) => (
        <Space>
          <UserOutlined className="order-list-icon-green" />
          <span className="order-list-cell-client">{name}</span>
        </Space>
      ),
    },
    {
      title: 'Téléphone',
      dataIndex: 'customer_phone',
      key: 'customer_phone',
      responsive: ['md'] as any,
      render: (phone: string) => (
        <Space>
          <PhoneOutlined className="order-list-icon-gray" />
          <span className="order-list-cell-phone">{phone}</span>
        </Space>
      ),
    },
    {
      title: 'Articles',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      align: 'center' as const,
      responsive: ['lg'] as any,
      render: (items: OrderItem[]) => (
        <Tag color="orange" className="order-list-tag">
          {items?.length || 0} article{items?.length > 1 ? 's' : ''}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      align: 'right' as const,
      render: (total: number) => (
        <span className="order-list-cell-total">
          {total.toLocaleString('fr-FR')} F
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      responsive: ['lg'] as any,
      render: (date: string) => (
        <span className="order-list-cell-date">
          {date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: Order) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(record.id);
          }}
          className="order-list-actions-button"
          size={isMobile ? 'small' : 'middle'}
        >
          {!isMobile && 'Détails'}
        </Button>
      ),
    },
  ];

  const MobileOrderCard = ({ order }: { order: Order }) => (
    <Card
      className="order-list-mobile-card"
      onClick={() => handleClick(order.id)}
      bodyStyle={{ padding: '16px' }}
    >
      <div className="order-list-mobile-card-header">
        <Tag color="blue" className="order-list-tag">
          #{order.id.toString().padStart(4, '0')}
        </Tag>
        <span className="order-list-cell-total">
          {order.total.toLocaleString('fr-FR')} F
        </span>
      </div>

      <div className="order-list-mobile-card-info">
        <Space>
          <UserOutlined className="order-list-icon-green" />
          <span className="order-list-cell-client">{order.customer_name}</span>
        </Space>
      </div>

      <div className="order-list-mobile-card-info">
        <Space>
          <PhoneOutlined className="order-list-icon-gray" />
          <span className="order-list-cell-phone">{order.customer_phone}</span>
        </Space>
      </div>

      <div className="order-list-mobile-card-footer">
        <Space>
          <Tag color="orange" className="order-list-tag">
            {order.items?.length || 0} article{order.items?.length > 1 ? 's' : ''}
          </Tag>
          {order.created_at && (
            <Space size={4}>
              <CalendarOutlined className="order-list-mobile-card-icon" />
              <span className="order-list-mobile-card-date">
                {new Date(order.created_at).toLocaleDateString('fr-FR')}
              </span>
            </Space>
          )}
        </Space>
      </div>
    </Card>
  );

  return (
    <div className={`order-list-container ${isMobile ? 'order-list-container-mobile' : ''}`}>
      <Card className="order-list-card">
        {/* Header */}
        <div className={`order-list-header ${isMobile ? 'order-list-header-mobile' : ''}`}>
          <div className="order-list-header-left">
            <div className={`order-list-logo-container ${isMobile ? 'order-list-logo-container-mobile' : ''}`}>
              <ShoppingCartOutlined className={`order-list-logo-icon ${isMobile ? 'order-list-logo-icon-mobile' : ''}`} />
            </div>
            <div>
              <h1 className={`order-list-title ${isMobile ? 'order-list-title-mobile' : ''}`}>
                Gestion des Commandes
              </h1>
              <p className={`order-list-subtitle ${isMobile ? 'order-list-subtitle-mobile' : ''}`}>
                {isMobile ? 'Toutes vos commandes' : 'Consultez et gérez toutes vos commandes'}
              </p>
            </div>
          </div>

          <Button
            type="primary"
            size={isMobile ? 'middle' : 'large'}
            icon={<PlusOutlined />}
            onClick={() => navigate('/orders/create')}
            className={`order-list-create-button ${isMobile ? 'order-list-create-button-mobile' : ''}`}
          >
            {isMobile ? 'Nouvelle Commande' : 'Créer une Commande'}
          </Button>
        </div>

        {/* Stats */}
        <div className={`order-list-stats ${isMobile ? 'order-list-stats-mobile' : ''}`}>
          <div className={`order-list-stat-card order-list-stat-card-green ${isMobile ? 'order-list-stat-card-mobile' : ''}`}>
            <p className="order-list-stat-label order-list-stat-label-green">
              Total Commandes
            </p>
            <p className={`order-list-stat-value order-list-stat-value-green ${isMobile ? 'order-list-stat-value-mobile' : 'order-list-stat-value-desktop'}`}>
              {orders.length}
            </p>
          </div>

          <div className={`order-list-stat-card order-list-stat-card-yellow ${isMobile ? 'order-list-stat-card-mobile' : ''}`}>
            <p className="order-list-stat-label order-list-stat-label-yellow">
              Revenu Total
            </p>
            <p className={`order-list-stat-value order-list-stat-value-yellow ${isMobile ? 'order-list-stat-value-mobile' : 'order-list-stat-value-desktop'}`}>
              {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString('fr-FR')} F
            </p>
          </div>

          <div className={`order-list-stat-card order-list-stat-card-blue ${isMobile ? 'order-list-stat-card-mobile' : ''}`}>
            <p className="order-list-stat-label order-list-stat-label-blue">
              Articles Commandés
            </p>
            <p className={`order-list-stat-value order-list-stat-value-blue ${isMobile ? 'order-list-stat-value-mobile' : 'order-list-stat-value-desktop'}`}>
              {orders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}
            </p>
          </div>
        </div>

        {/* Table ou card  */}
        {isMobile ? (
          <div>
            {loading ? (
              <div className="order-list-loading">
                <p>Chargement...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="order-list-empty-state">
                <ShoppingCartOutlined className="order-list-empty-icon" />
                <p className="order-list-empty-text">
                  Aucune commande pour le moment
                </p>
                <Button
                  type="primary"
                  className="order-list-empty-button"
                  onClick={() => navigate('/orders/create')}
                >
                  Créer votre première commande
                </Button>
              </div>
            ) : (
              orders.map(order => <MobileOrderCard key={order.id} order={order} />)
            )}
          </div>
        ) : (
          <Table
            rowKey="id"
            dataSource={orders}
            onRow={(record) => ({
              onClick: () => handleClick(record.id),
              style: { cursor: 'pointer' }
            })}
            columns={columns}
            loading={loading}
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: false,
              simple: false,
              style: { marginTop: '16px' },
            }}
            className="order-list-table"
            locale={{
              emptyText: (
                <div className="order-list-empty-state">
                  <ShoppingCartOutlined className="order-list-empty-icon" />
                  <p className="order-list-empty-text">
                    Aucune commande pour le moment
                  </p>
                  <Button
                    type="primary"
                    className="order-list-empty-button"
                    onClick={() => navigate('/orders/create')}
                  >
                    Créer votre première commande
                  </Button>
                </div>
              ),
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default OrdersList;