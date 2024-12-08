import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, AlertCircle, X, ArrowDown } from 'lucide-react';

export default function MenuManagement() {
  const formRef = useRef(null);
  const alertRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    ingredients: [],
    nutritionalInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    },
    allergens: [],
    availability: true,
    imageUrl: '',
    preparationTime: '',
    createdBy: '60f7e5d4f88d0c4568b1e8b3"'
  });

  const categories = [
    'APPETIZER', 'MAIN_COURSE', 'DESSERT',
    'BEVERAGE', 'SIDES', 'SPECIALS'
  ];

  const allergenOptions = [
    'GLUTEN', 'DAIRY', 'NUTS', 'SHELLFISH', 'SOY', 'EGGS'
  ];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? 'http://localhost:3000/menu/update' : 'http://localhost:3000/menu/add';
      const method = isEditing ? 'PUT' : 'POST';
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null
      };

      if (isEditing) {
        submitData.id = editingId;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      if (!response.ok) throw new Error('Failed to save menu item');
      const savedItem = await response.json();
      
      if (isEditing) {
        setMenuItems(prev => prev.map(item => item._id === editingId ? savedItem : item));
        showAlert('Menu item updated successfully', 'success');
      } else {
        setMenuItems(prev => [...prev, savedItem]);
        showAlert('Menu item added successfully', 'success');
      }
      
      resetForm();
      scrollToAlert();
    } catch (error) {
      showAlert(error.message, 'error');
      scrollToAlert();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/menu/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Failed to delete menu item');

      await response.json();
      setMenuItems(prev => prev.filter(item => item._id !== id));
      showAlert('Menu item deleted successfully', 'success');
      scrollToAlert();
    } catch (error) {
      showAlert(error.message, 'error');
      scrollToAlert();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      ingredients: item.ingredients || [],
      nutritionalInfo: item.nutritionalInfo || { calories: '', protein: '', carbs: '', fat: '' }
    });
    setIsEditing(true);
    setEditingId(item._id);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const scrollToAlert = () => {
    setTimeout(() => {
      alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      ingredients: [],
      nutritionalInfo: { calories: '', protein: '', carbs: '', fat: '' },
      allergens: [],
      availability: true,
      imageUrl: '',
      preparationTime: '',
      createdBy: 'user123'
    });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAllergenChange = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleIngredientChange = (e) => {
    const ingredients = e.target.value.split(',').map(i => i.trim());
    setFormData(prev => ({ ...prev, ingredients }));
  };

  return (
    <>
      <style>
        {`
         .menu-container {
  min-height: 100vh;
  background-color: #111827;
  padding: 32px;
  color: #ffffff;
}

.dashboard-header {
  background: #111827;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 71, 87, 0.2);
  backdrop-filter: blur(8px);
}
.dashboard-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ff4757;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  text-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
  margin: 1px;
  position: relative; /* Ensure ::after is positioned relative to the text */
  &::after {
    content: '';
    position: absolute;
    bottom: -1px; /* Adjusted for spacing between text and strip */
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(to right, transparent, #ff4757, transparent);
  }
}
.gradient-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(31, 38, 49, 0.9) 0%, rgba(26, 32, 44, 0.95) 100%);
  pointer-events: none;
  z-index: -1;
  animation: gradientShift 15s ease infinite;
}


.alert {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.alert.success { background-color: rgba(6, 78, 59, 0.5); }
.alert.error { background-color: rgba(153, 27, 27, 0.5); }

.card {
  background-color: #1f2937;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #374151;
  margin-bottom: 32px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  color: #ef4444;
}

.form-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #e5e7eb;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #374151;
  background-color: #1f2937;
  color: #e5e7eb;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button-primary {
  background-color: #ef4444;
  color: white;
}

.button-primary:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
}

.table-container {
  overflow-x: auto;
  margin-top: 24px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  background-color: #374151;
  padding: 12px;
  text-align: left;
  font-weight: 500;
  color: #e5e7eb;
}

.table td {
  padding: 12px;
  color: #e5e7eb;
  border-bottom: 1px solid #374151;
}

.table tr:hover td {
  background-color: rgba(55, 65, 81, 0.5);
}

.action-button {
  padding: 6px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
}

.edit-button:hover {
  color: #60a5fa;
}

.delete-button:hover {
  color: #ef4444;
}

.allergen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.allergen-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e5e7eb;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: rgba(6, 78, 59, 0.5);
  color: #34d399;
}

.status-inactive {
  background-color: rgba(153, 27, 27, 0.5);
  color: #ef4444;
}
        `}
      </style>
      <div className="gradient-overlay" />
      <div className="dashboard-header">
        <h1 className="dashboard-title">Menu Dashboard</h1>
      </div>

      <div className="menu-container">
        {alert.show && (
          <div ref={alertRef} className={`alert ${alert.type}`}>
            <AlertCircle size={20} />
            <span>{alert.message}</span>
          </div>
        )}

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Menu Items</h2>
            <button className="button button-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? <X size={20} /> : <Plus size={20} />}
              {showForm ? ' Close Form' : ' Add New Item'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} ref={formRef}>
              <div className="form-grid">
                <div>
                  <div className="form-group">
                    <label className="form-label">Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description*</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price*</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-input"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="form-group">
                    <label className="form-label">Category*</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                 <div className="form-group">
                    <label className="form-label">Ingredients (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.ingredients.join(', ')}
                      onChange={handleIngredientChange}
                      className="form-input"
                      placeholder="e.g., tomato, cheese, basil"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preparation Time (minutes)</label>
                    <input
                      type="number"
                      name="preparationTime"
                      value={formData.preparationTime}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nutritional Information</label>
                <div className="form-grid">
                  {Object.keys(formData.nutritionalInfo).map(key => (
                    <div key={key} className="form-group">
                      <label className="form-label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                      <input
                        type="number"
                        name={`nutritionalInfo.${key}`}
                        value={formData.nutritionalInfo[key]}
                        onChange={handleInputChange}
                        className="form-input"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Allergens</label>
                <div className="allergen-grid">
                  {allergenOptions.map(allergen => (
                    <label key={allergen} className="allergen-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.allergens.includes(allergen)}
                        onChange={() => handleAllergenChange(allergen)}
                      />
                      <span>{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Availability</label>
                <label className="allergen-checkbox">
                  <input
                    type="checkbox"
                    name="availability"
                    checked={formData.availability}
                    onChange={(e) => handleInputChange({
                      target: { name: 'availability', value: e.target.checked }
                    })}
                  />
                  <span>Available</span>
                </label>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button type="submit" className="button button-primary" disabled={loading}>
                  {loading ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="button"
                    style={{ marginLeft: '10px' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="table-container" style={{ marginTop: '20px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${item.availability ? 'status-active' : 'status-inactive'}`}>
                        {item.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleEdit(item)}
                        className="action-button edit-button"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="action-button delete-button"
                        style={{ marginLeft: '8px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}