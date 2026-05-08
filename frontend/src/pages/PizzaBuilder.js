import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Base', 'Sauce', 'Cheese', 'Veggies', 'Review & Pay'];
const STEP_EMOJIS = ['🍞', '🍅', '🧀', '🥗', '💳'];

const BASE_OPTIONS = [
  { name: 'Classic Crust', emoji: '🥖', desc: 'Hand-tossed tradition', price: 50 },
  { name: 'Thin Crust', emoji: '🫓', desc: 'Crispy & light', price: 50 },
  { name: 'Thick Crust', emoji: '🍞', desc: 'Fluffy & chewy', price: 60 },
  { name: 'Stuffed Crust', emoji: '🧀', desc: 'Cheese-filled edges', price: 80 },
  { name: 'Sourdough Crust', emoji: '🫶', desc: 'Tangy artisan', price: 70 },
];
const SAUCE_OPTIONS = [
  { name: 'Tomato Basil', emoji: '🍅', desc: 'Classic marinara', price: 30 },
  { name: 'BBQ Sauce', emoji: '🔥', desc: 'Smoky & sweet', price: 35 },
  { name: 'Pesto', emoji: '🌿', desc: 'Fresh basil', price: 40 },
  { name: 'Arrabbiata', emoji: '🌶️', desc: 'Spicy tomato', price: 35 },
  { name: 'White Garlic', emoji: '🧄', desc: 'Creamy garlic', price: 40 },
];
const CHEESE_OPTIONS = [
  { name: 'Mozzarella', emoji: '🧀', desc: 'Classic stretchy', price: 60 },
  { name: 'Cheddar', emoji: '🍊', desc: 'Sharp & creamy', price: 60 },
  { name: 'Parmesan', emoji: '⭐', desc: 'Hard Italian', price: 70 },
  { name: 'Ricotta', emoji: '☁️', desc: 'Soft & creamy', price: 65 },
  { name: 'Feta', emoji: '💎', desc: 'Crumbly Greek', price: 75 },
];
const VEGGIE_OPTIONS = [
  { name: 'Tomatoes', emoji: '🍅', price: 20 },
  { name: 'Mushrooms', emoji: '🍄', price: 25 },
  { name: 'Bell Peppers', emoji: '🫑', price: 20 },
  { name: 'Onions', emoji: '🧅', price: 15 },
  { name: 'Spinach', emoji: '🌿', price: 20 },
  { name: 'Jalapeños', emoji: '🌶️', price: 25 },
  { name: 'Olives', emoji: '🫒', price: 30 },
  { name: 'Corn', emoji: '🌽', price: 15 },
  { name: 'Zucchini', emoji: '🥒', price: 25 },
  { name: 'Basil', emoji: '🌱', price: 15 },
];

function calcPrice(pizza) {
  const base = BASE_OPTIONS.find(b => b.name === pizza.base)?.price || 0;
  const sauce = SAUCE_OPTIONS.find(s => s.name === pizza.sauce)?.price || 0;
  const cheese = CHEESE_OPTIONS.find(c => c.name === pizza.cheese)?.price || 0;
  const veggies = (pizza.veggies || []).reduce((sum, v) => sum + (VEGGIE_OPTIONS.find(o => o.name === v)?.price || 0), 0);
  return base + sauce + cheese + veggies + 100;
}

export default function PizzaBuilder() {
  const [step, setStep] = useState(0);
  const [pizza, setPizza] = useState({ base: '', sauce: '', cheese: '', veggies: [], name: 'Custom Pizza' });
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { api, user } = useAuth();
  const navigate = useNavigate();

  const handleVeggieToggle = (name) => {
    setPizza(p => ({
      ...p,
      veggies: p.veggies.includes(name) ? p.veggies.filter(v => v !== name) : [...p.veggies, name]
    }));
  };

  const canProceed = () => {
    if (step === 0) return pizza.base;
    if (step === 1) return pizza.sauce;
    if (step === 2) return pizza.cheese;
    return true;
  };

  const handlePayment = async () => {
    if (!address.trim()) return toast.error('Please enter delivery address');
    setLoading(true);
    try {
      const totalPrice = calcPrice(pizza);
      await api.post('/orders', {
        pizza,
        totalPrice,
        deliveryAddress: address,
        paymentId: 'demo_payment_' + Date.now(),
        razorpayOrderId: 'demo_order_' + Date.now(),
      });
      toast.success('🎉 Order confirmed! Enjoy your pizza!');
      navigate('/my-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = calcPrice(pizza);

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Build Your <span>Pizza</span> 🍕</h1>
        <p>Craft your perfect pizza step by step</p>
      </div>

      <div className="steps-nav">
        {STEPS.map((s, i) => (
          <div className="step-item" key={i}>
            <div className="step-col">
              <div className={`step-circle ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                {i < step ? '✓' : STEP_EMOJIS[i]}
              </div>
              <p className={`step-label ${i === step ? 'active' : ''}`}>{s}</p>
            </div>
            {i < STEPS.length - 1 && <div className={`step-connector ${i < step ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="builder-layout">
        <div>
          {step === 0 && (
            <>
              <h2 style={{ marginBottom: '1rem' }}>Choose your <span style={{ color: 'var(--accent)' }}>Crust Base</span></h2>
              <div className="option-grid">
                {BASE_OPTIONS.map(opt => (
                  <div key={opt.name} className={`option-card ${pizza.base === opt.name ? 'selected' : ''}`} onClick={() => setPizza({ ...pizza, base: opt.name })}>
                    <span className="option-emoji">{opt.emoji}</span>
                    <div className="option-name">{opt.name}</div>
                    <div className="option-desc">{opt.desc}</div>
                    <div className="option-price">+₹{opt.price}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 style={{ marginBottom: '1rem' }}>Choose your <span style={{ color: 'var(--accent)' }}>Sauce</span></h2>
              <div className="option-grid">
                {SAUCE_OPTIONS.map(opt => (
                  <div key={opt.name} className={`option-card ${pizza.sauce === opt.name ? 'selected' : ''}`} onClick={() => setPizza({ ...pizza, sauce: opt.name })}>
                    <span className="option-emoji">{opt.emoji}</span>
                    <div className="option-name">{opt.name}</div>
                    <div className="option-desc">{opt.desc}</div>
                    <div className="option-price">+₹{opt.price}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ marginBottom: '1rem' }}>Choose your <span style={{ color: 'var(--accent)' }}>Cheese</span></h2>
              <div className="option-grid">
                {CHEESE_OPTIONS.map(opt => (
                  <div key={opt.name} className={`option-card ${pizza.cheese === opt.name ? 'selected' : ''}`} onClick={() => setPizza({ ...pizza, cheese: opt.name })}>
                    <span className="option-emoji">{opt.emoji}</span>
                    <div className="option-name">{opt.name}</div>
                    <div className="option-desc">{opt.desc}</div>
                    <div className="option-price">+₹{opt.price}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ marginBottom: '0.5rem' }}>Add your <span style={{ color: 'var(--accent)' }}>Veggies</span></h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>Select as many as you like</p>
              <div className="option-grid">
                {VEGGIE_OPTIONS.map(opt => (
                  <div key={opt.name} className={`option-card ${pizza.veggies.includes(opt.name) ? 'multi-selected' : ''}`} onClick={() => handleVeggieToggle(opt.name)}>
                    <span className="option-emoji">{opt.emoji}</span>
                    <div className="option-name">{opt.name}</div>
                    <div className="option-price">+₹{opt.price}</div>
                    {pizza.veggies.includes(opt.name) && <div style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: '0.25rem' }}>✓ Added</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={{ marginBottom: '1.5rem' }}>Review & <span style={{ color: 'var(--accent)' }}>Confirm</span></h2>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>🍕 Your Custom Pizza</h3>
                <div className="summary-item"><span className="summary-label">🍞 Base</span><span>{pizza.base}</span></div>
                <div className="summary-item"><span className="summary-label">🍅 Sauce</span><span>{pizza.sauce}</span></div>
                <div className="summary-item"><span className="summary-label">🧀 Cheese</span><span>{pizza.cheese}</span></div>
                <div className="summary-item">
                  <span className="summary-label">🥗 Veggies</span>
                  <span>{pizza.veggies.length > 0 ? pizza.veggies.join(', ') : 'None'}</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input className="form-input" placeholder="Enter your complete delivery address" value={address}
                  onChange={e => setAddress(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-full" style={{ padding: '1rem', fontSize: '1.05rem' }} onClick={handlePayment} disabled={loading}>
                {loading ? 'Placing order...' : `🍕 Place Order - ₹${totalPrice}`}
              </button>
            </>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {step > 0 && <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>}
            {step < 4 && (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                style={{ marginLeft: 'auto' }}>
                {step === 3 ? 'Review Order →' : 'Next →'}
              </button>
            )}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">🛒 Your Order</div>
          {pizza.base && <div className="summary-item"><span className="summary-label">Base</span><span className="summary-value">{pizza.base}</span></div>}
          {pizza.sauce && <div className="summary-item"><span className="summary-label">Sauce</span><span className="summary-value">{pizza.sauce}</span></div>}
          {pizza.cheese && <div className="summary-item"><span className="summary-label">Cheese</span><span className="summary-value">{pizza.cheese}</span></div>}
          {pizza.veggies.length > 0 && <div className="summary-item"><span className="summary-label">Veggies</span><span className="summary-value">{pizza.veggies.length} added</span></div>}
          <div style={{ margin: '1rem 0', borderTop: '1px solid var(--border)' }} />
          <div className="summary-item"><span className="summary-label">Base charge</span><span>₹100</span></div>
          {pizza.base && <div className="summary-item"><span className="summary-label">Crust</span><span>₹{BASE_OPTIONS.find(b => b.name === pizza.base)?.price || 0}</span></div>}
          {pizza.sauce && <div className="summary-item"><span className="summary-label">Sauce</span><span>₹{SAUCE_OPTIONS.find(s => s.name === pizza.sauce)?.price || 0}</span></div>}
          {pizza.cheese && <div className="summary-item"><span className="summary-label">Cheese</span><span>₹{CHEESE_OPTIONS.find(c => c.name === pizza.cheese)?.price || 0}</span></div>}
          {pizza.veggies.length > 0 && <div className="summary-item"><span className="summary-label">Toppings ({pizza.veggies.length})</span><span>₹{pizza.veggies.reduce((s, v) => s + (VEGGIE_OPTIONS.find(o => o.name === v)?.price || 0), 0)}</span></div>}
          <div className="summary-total"><span>Total</span><span className="price">₹{totalPrice}</span></div>
        </div>
      </div>
    </div>
  );
}