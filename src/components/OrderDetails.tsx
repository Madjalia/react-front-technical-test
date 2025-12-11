import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Table, message, Image, Space, Tag, Divider } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ShoppingOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/styles/OrderDetails.css';

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

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  
  const API_URL ='http://localhost:8000/api';

  useEffect(() => {
    //  taille d'écran
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Recuperer les donnees de la commande
    axios.get(`${API_URL}/orders/${id}`)
      .then(res => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur de chargement:', error);
        message.error('Erreur lors du chargement de la commande');
        setLoading(false);
      });
    
    return () => window.removeEventListener('resize', handleResize);
  }, [id, API_URL]);

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      axios.delete(`${API_URL}/orders/${id}`)
        .then(() => {
          message.success('Commande supprimée avec succès');
          navigate('/');
        })
        .catch(() => {
          message.error('Erreur lors de la suppression');
        });
    }
  };

  const handleEdit = () => {
    navigate(`/orders/edit/${id}`);
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'product_img',
      key: 'product_img',
      width: 100,
      responsive: ['md'] as any,
      render: (product_img: string, record: OrderItem) => (
        <div className="order-details-image-cell">
          {product_img ? (
            <Image
              src={product_img}
              alt={record.product_name}
              width={60}
              height={60}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <ShoppingOutlined style={{ fontSize: '24px', color: '#d1d5db' }} />
          )}
        </div>
      ),
    },
    {
      title: 'Produit',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name: string) => (
        <span className="order-details-product-name">{name}</span>
      ),
    },
    {
      title: 'Prix',
      dataIndex: 'unit_price',
      key: 'unit_price',
      align: 'right' as const,
      responsive: ['lg'] as any,
      render: (price: number) => (
        <span className="order-details-price-cell">
          {price.toLocaleString('fr-FR')} FCFA
        </span>
      ),
    },
    {
      title: 'Qté',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      render: (quantity: number) => (
        <Tag color="orange" className="order-details-quantity-tag">
          x {quantity}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right' as const,
      render: (subtotal: number) => (
        <span className="order-details-subtotal-cell">
          {subtotal.toLocaleString('fr-FR')} FCFA
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="order-details-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '16px' }}>
        <Card>
          <p>Commande non trouvée</p>
          <Button onClick={() => navigate('/')}>Retour</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="order-details-container">
      <Card className="order-details-card">
        {/* En-tête de la commande */}
        <div className="order-details-header">
          <div className="order-details-header-left">
            <div className="order-details-icon-box">
              <ShoppingOutlined className="order-details-icon" />
            </div>
            <div>
              <h1 className="order-details-title">
                Commande #{order.id.toString().padStart(5, '0')}
              </h1>
              <p className={`order-details-subtitle ${isMobile ? 'hidden-on-mobile' : ''}`}>
                Détails complets de la commande
              </p>
            </div>
          </div>

          <Space size="middle" className="order-details-actions">
            <Button
              type="default"
              size="large"
              icon={<EditOutlined />}
              onClick={handleEdit}
              className="order-details-edit-button"
            >
              <span className={isMobile ? 'hidden-on-mobile' : ''}>
                Modifier
              </span>
            </Button>
            <Button
              danger
              size="large"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              className="order-details-delete-button"
            >
              <span className={isMobile ? 'hidden-on-mobile' : ''}>
                Supprimer
              </span>
            </Button>
          </Space>
        </div>

        {/* Information client et commande */}
        <div className="order-details-info-cards">
          <div className="order-details-info-card order-details-info-card-green">
            <div className="order-details-info-card-header">
              <UserOutlined className="order-details-info-card-icon" style={{ color: '#16a34a' }} />
              <span className="order-details-info-card-label order-details-info-card-label-green">
                CLIENT
              </span>
            </div>
            <p className="order-details-info-card-value">
              {order.customer_name}
            </p>
          </div>

          <div className="order-details-info-card order-details-info-card-blue">
            <div className="order-details-info-card-header">
              <PhoneOutlined className="order-details-info-card-icon" style={{ color: '#2563eb' }} />
              <span className="order-details-info-card-label order-details-info-card-label-blue">
                TÉLÉPHONE
              </span>
            </div>
            <p className="order-details-info-card-value">
              {order.customer_phone}
            </p>
          </div>

          {order.created_at && (
            <div className="order-details-info-card order-details-info-card-yellow">
              <div className="order-details-info-card-header">
                <CalendarOutlined className="order-details-info-card-icon" style={{ color: '#d97706' }} />
                <span className="order-details-info-card-label order-details-info-card-label-yellow">
                  DATE
                </span>
              </div>
              <p className="order-details-info-card-value">
                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        <Divider style={{ margin: '24px 0' }} />

        {/* produits */}
        <div style={{ marginBottom: '16px' }}>
          <h2 className="order-details-products-title">
            Produits Commandés
          </h2>
          <p className="order-details-products-subtitle">
            {order.items?.length || 0} article{order.items?.length > 1 ? 's' : ''} dans cette commande
          </p>
        </div>

        {/* Table produits */}
        <Table
          rowKey="id"
          dataSource={order.items}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content' }}
          className="order-details-table"
        />

        {/* Total */}
        <div className="order-details-total-container">
          <div className={`order-details-total-box ${isMobile ? 'full-width-on-mobile' : ''}`}>
            <div className="order-details-total-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="order-details-total-label">
                  TOTAL
                </span>
              </div>
              <span className={`order-details-total-amount ${isMobile ? 'smaller-on-mobile' : ''}`}>
                {order.total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetails;