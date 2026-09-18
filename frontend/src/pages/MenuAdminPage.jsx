import React, { useEffect, useState } from 'react';
import ApiService from '../services/ApiService';
import { useNavigate } from 'react-router-dom';
import './MenuAdminPage.css';
import { resolveImageUrl, formatPrice } from '../utils/menuUtils';

const MenuAdminPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '', price: '', category: '', description: '', image: null, available: true
  });

  const [refresh, setRefresh] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pendingToggle, setPendingToggle] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [editModal, setEditModal] = useState({
    open: false, item: null, name: '', price: '', category: ''
  });

  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        console.log('[MenuAdminPage] Fetching all menu items...');
        const items = await ApiService.getAllMenuItems(token);
        console.log('[MenuAdminPage] Menu items received:', items);
        setMenuItems(Array.isArray(items) ? items : []);
        setError('');
      } catch (e) {
        console.error('[MenuAdminPage] Failed to fetch menu items:', e);
        setError("Failed to fetch menu items");
        setMenuItems([]);
      }
      setLoading(false);
    };
    fetchMenu();
  }, [token, refresh]);

  const handleImageChange = (e) => {
    setNewItem({ ...newItem, image: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await ApiService.createMenuItem(token, newItem);
      setShowAdd(false);
      setNewItem({ name: "", price: "", category: "", description: "", image: null, available: true });
      setRefresh(r => !r);
    } catch (error) {
      console.error('[MenuAdminPage] Failed to add menu item:', error);
      setError("Failed to add menu item");
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await ApiService.updateMenuItemAvailability(token, id);
      setRefresh(r => !r);
    } catch {
      setError("Failed to update availability");
    }
  };

  const handleSwitchClick = (item) => {
    if (item.available) {
      setPendingToggle(item);
    } else {
      handleToggleAvailability(item.id);
    }
  };

  const handleConfirmToggle = async () => {
    if (pendingToggle) {
      await handleToggleAvailability(pendingToggle.id);
      setPendingToggle(null);
    }
  };

  const handleCancelToggle = () => {
    setPendingToggle(null);
  };

  // --- Modifier ---
  const openEditModal = (item) => {
    setEditModal({
      open: true,
      item,
      name: item.name,
      price: item.price,
      category: item.category
    });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, item: null, name: '', price: '', category: '' });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const { item, name, price, category } = editModal;

      if (name !== item.name) {
        await ApiService.updateMenuItemName(token, item.id, name);
      }
      if (Number(price) !== item.price) {
        await ApiService.updateMenuItemPrice(token, item.id, price);
      }
      if (category !== item.category) {
        await ApiService.updateMenuItemCategory(token, item.id, category);
      }

      closeEditModal();
      setRefresh(r => !r);
    } catch (err) {
      console.error('[MenuAdminPage] Failed to edit menu item:', err);
      setError("Failed to edit menu item");
    }
  };

  // --- Supprimer ---
  const handleDeleteClick = (item) => {
    setPendingDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (pendingDelete) {
      try {
        await ApiService.deleteMenuItem(token, pendingDelete.id);
        setRefresh(r => !r);
      } catch (err) {
        console.error('[MenuAdminPage] Failed to delete menu item:', err);
        setError("Failed to delete menu item");
      }
      setPendingDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  const categoryOptions = ["Entrée", "Plat", "Dessert", "Boisson"];

  return (
    <div className="menu-admin-container">
      <h2>Gestion de Menu</h2>

      <div className="menu-admin-btn-row">
        <button onClick={() => navigate('/admin')}>⬅ Retour</button>
        <button onClick={() => setShowAdd(!showAdd)} className="menu-admin-add-btn">
          {showAdd ? "Cancel" : "Ajouter un nouveau plat"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddItem} className="menu-admin-form">
          <input name="name" placeholder="Name" value={newItem.name} onChange={handleInputChange} required />
          <input name="price" type="number" placeholder="Price" value={newItem.price} onChange={handleInputChange} required />
          <select name="category" value={newItem.category} onChange={handleInputChange} required>
            <option value="">Choisir Categorie</option>
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <textarea name="description" placeholder="Description" value={newItem.description} onChange={handleInputChange} />
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <select
            value={newItem.available}
            onChange={(e) => setNewItem({ ...newItem, available: e.target.value === "true" })}
          >
            <option value="true">Disponible</option>
            <option value="false">Indisponible</option>
          </select>
          <button type="submit">Ajouter menu</button>
        </form>
      )}

      {!loading && !error && menuItems.length > 0 && (
        <div className="menu-admin-filter-row">
          <label>Filtrer par catégorie :</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Toutes</option>
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="menu-admin-error">{error}</p>
      ) : menuItems.length === 0 ? (
        <p className="menu-admin-empty">Aucun plat enregistré dans le menu.</p>
      ) : (
        <table className="menu-admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Prix</th>
              <th>Categorie</th>
              <th>Disponible</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems
              .filter(item => !categoryFilter || item.category === categoryFilter)
              .map(item => (
                <tr key={item.id}>
                  <td>
                    {item.imageUrl ? (
                      <img
                        src={resolveImageUrl(item.imageUrl)}
                        alt={item.name}
                        className="menu-admin-thumb"
                        onError={(e) => {
                          console.warn('[MenuAdminPage] Image failed to load:', item.imageUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="menu-admin-no-image">—</span>
                    )}
                  </td>
                  <td>{item.name}</td>
                  <td className="menu-admin-description">{item.description || '—'}</td>
                  <td>CFA{formatPrice(item.price)}</td>
                  <td>{item.category}</td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.available}
                        onChange={() => handleSwitchClick(item)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td className="menu-admin-actions">
                    <button className="menu-admin-edit-btn" onClick={() => openEditModal(item)}>Modifier</button>
                    <button className="menu-admin-delete-btn" onClick={() => handleDeleteClick(item)}>Supprimer</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {pendingToggle && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-box">
            <p>Êtes-vous sûr?</p>
            <button onClick={handleConfirmToggle}>Oui</button>
            <button onClick={handleCancelToggle}>Non</button>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-box">
            <p>Supprimer « {pendingDelete.name} » définitivement ?</p>
            <button onClick={handleConfirmDelete}>Oui, supprimer</button>
            <button onClick={handleCancelDelete}>Annuler</button>
          </div>
        </div>
      )}

      {editModal.open && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-box menu-edit-box">
            <p className="menu-edit-title">Modifier le plat</p>
            <form onSubmit={handleSaveEdit} className="menu-edit-form">
              <label>Nom</label>
              <input
                value={editModal.name}
                onChange={e => setEditModal({ ...editModal, name: e.target.value })}
                required
              />

              <label>Prix</label>
              <input
                type="number"
                value={editModal.price}
                onChange={e => setEditModal({ ...editModal, price: e.target.value })}
                required
              />

              <label>Catégorie</label>
              <select
                value={editModal.category}
                onChange={e => setEditModal({ ...editModal, category: e.target.value })}
                required
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div className="menu-edit-buttons">
                <button type="submit">Enregistrer</button>
                <button type="button" onClick={closeEditModal}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuAdminPage;