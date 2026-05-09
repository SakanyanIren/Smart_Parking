import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [view, setView] = useState('choice'); // 'choice', 'login', or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);
  const { signIn, signUp, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePhone = (phone) => {
    // Optional field, but if provided, should be valid
    if (!phone) return true;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation (required for both login and signup)
    if (!email.trim()) {
      newErrors.email = 'Էլ. հասցեն պարտադիր է';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Խնդրում ենք մուտքագրել վավեր էլ. հասցե';
    }

    // Password validation (required for both login and signup)
    if (!password) {
      newErrors.password = 'Գաղտնաբառը պարտադիր է';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Գաղտնաբառը պետք է լինի առնվազն 6 նիշ';
    }

    // Full name validation (required only for signup)
    if (view === 'signup') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Անուն ազգանունը պարտադիր է';
      } else if (fullName.trim().length < 2) {
        newErrors.fullName = 'Անունը պետք է լինի առնվազն 2 նիշ';
      }

      // Phone validation (optional for signup)
      if (phone && !validatePhone(phone)) {
        newErrors.phone = 'Խնդրում ենք մուտքագրել վավեր հեռախոսահամար';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      if (view === 'login') {
        // Supabase login
        const { data, error } = await signIn(email.trim(), password);

        if (error) {
          // Handle specific error messages
          if (error.message.includes('Invalid login credentials')) {
            setErrors({ submit: 'Սխալ էլ. հասցե կամ գաղտնաբառ' });
            setShowResendLink(false);
          } else if (error.message.includes('Email not confirmed')) {
            setErrors({
              submit: 'Էլ. հասցեն հաստատված չէ: Ստուգեք ձեր փոստատուփը և սեղմեք հաստատման հղումը:'
            });
            setShowResendLink(true);
          } else {
            setErrors({ submit: error.message });
            setShowResendLink(false);
          }
          setLoading(false);
          return;
        }

        // Successfully logged in
        navigate('/');
      } else {
        // Supabase signup
        const { data, error } = await signUp(
          email.trim(),
          password,
          fullName.trim(),
          phone.trim() || null
        );

        if (error) {
          // Handle specific error messages
          if (error.message.includes('already registered')) {
            setErrors({ submit: 'Այս էլ. հասցեն արդեն գրանցված է: Խնդրում ենք մուտք գործել:' });
          } else {
            setErrors({ submit: error.message });
          }
          setLoading(false);
          return;
        }

        // Check if email confirmation is required
        if (data?.user && !data.session) {
          // Email confirmation required - show success message (not error)
          alert('✅ Հաշիվը հաջողությամբ ստեղծվեց!\n\n📧 Ձեր էլ. հասցեին ուղարկվեց հաստատման հղում:\n\nԽնդրում ենք ստուգել ձեր փոստատուփը և սեղմել հղումը:\n\nՀաստատումից հետո կարող եք մուտք գործել:');
          setLoading(false);
          // Switch to login view
          setTimeout(() => {
            setView('login');
            resetForm();
          }, 2000);
        } else {
          // Auto-login after signup (email confirmation disabled)
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ submit: 'Տեղի ունեցավ անսպասելի սխալ: Խնդրում ենք կրկին փորձել:' });
      setLoading(false);
    }
  };

  const showLoginForm = () => {
    setView('login');
    resetForm();
  };

  const showSignupForm = () => {
    setView('signup');
    resetForm();
  };

  const backToChoice = () => {
    setView('choice');
    resetForm();
  };

  const handleResendVerification = async () => {
    if (!email) {
      setErrors({ submit: 'Նախ մուտքագրեք ձեր էլ. հասցեն' });
      return;
    }

    setLoading(true);
    const { error } = await resendVerificationEmail(email.trim());
    setLoading(false);

    if (error) {
      setErrors({ submit: 'Հաստատման նամակի վերաուղարկումը ձախողվեց: Կրկին փորձեք:' });
    } else {
      alert('✅ Հաստատման նամակն ուղարկված է!\n\nԽնդրում ենք ստուգել ձեր փոստատուփը (և spam թղթապանակը):');
      setShowResendLink(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setErrors({});
    setShowResendLink(false);
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-container">
          <div className="login-box">
            <div className="login-header">
              <div className="corner-frame top-left"></div>
              <div className="corner-frame top-right"></div>
              <h1>
                {view === 'choice' && 'ԱՆՎՏԱՆԳ ՄՈՒՏՔ'}
                {view === 'login' && 'ՄՈՒՏՔ'}
                {view === 'signup' && 'ՍՏԵՂԾԵԼ ՀԱՇԻՎ'}
              </h1>
              <p className="login-subtitle">ԿԱՅԱՆԱՏԵՂԻ ԱՄՐԱԳՐՄԱՆ ՀԱՄԱԿԱՐԳ</p>
              <div className="corner-frame bottom-left"></div>
              <div className="corner-frame bottom-right"></div>
            </div>

            {/* Choice View - Initial Screen with 2 Buttons */}
            {view === 'choice' && (
              <div className="choice-container">
                <p className="choice-description">
                  Ընտրեք տարբերակ կայանատեղի ամրագրման համակարգ մուտք գործելու համար
                </p>
                <div className="choice-buttons">
                  <button
                    type="button"
                    className="choice-button"
                    onClick={showLoginForm}
                  >
                    ՄՈՒՏՔ
                  </button>
                  <button
                    type="button"
                    className="choice-button"
                    onClick={showSignupForm}
                  >
                    ԳՐԱՆՑՎԵԼ
                  </button>
                </div>
              </div>
            )}

            {/* Login/Signup Form View */}
            {(view === 'login' || view === 'signup') && (
              <form className="login-form" onSubmit={handleSubmit}>
                {/* Email field - shown for both login and signup */}
                <div className="form-group">
                  <label htmlFor="email">ԷԼ. ՀԱՍՑԵ</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? 'error' : ''}
                    placeholder="user@example.com"
                    disabled={loading}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                {/* Password field - shown for both login and signup */}
                <div className="form-group">
                  <label htmlFor="password">ԳԱՂՏՆԱԲԱՌ</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? 'error' : ''}
                    placeholder={view === 'signup' ? 'Առնվազն 6 նիշ' : 'Մուտքագրեք գաղտնաբառը'}
                    disabled={loading}
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                {/* Full name field - only shown for signup */}
                {view === 'signup' && (
                  <div className="form-group">
                    <label htmlFor="fullName">ԱՆՈՒՆ ԱԶԳԱՆՈՒՆ</label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={errors.fullName ? 'error' : ''}
                      placeholder="Անի Մկրտչյան"
                      disabled={loading}
                    />
                    {errors.fullName && (
                      <span className="error-message">{errors.fullName}</span>
                    )}
                  </div>
                )}

                {/* Phone field - only shown for signup, optional */}
                {view === 'signup' && (
                  <div className="form-group">
                    <label htmlFor="phone">ՀԵՌԱԽՈՍԱՀԱՄԱՐ (Կամընտիր)</label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={errors.phone ? 'error' : ''}
                      placeholder="+1234567890"
                      disabled={loading}
                    />
                    {errors.phone && (
                      <span className="error-message">{errors.phone}</span>
                    )}
                  </div>
                )}

                {/* Submit error message */}
                {errors.submit && (
                  <div className="error-message submit-error">{errors.submit}</div>
                )}

                {/* Resend verification email link */}
                {showResendLink && view === 'login' && (
                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={loading}
                      className="resend-link"
                    >
                      Վերաուղարկել հաստատման նամակը
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <button type="submit" className="login-button" disabled={loading}>
                  {loading ? 'ԲԵՌՆՎՈՒՄ Է...' : (view === 'login' ? 'ՄՈՒՏՔ' : 'ՍՏԵՂԾԵԼ ՀԱՇԻՎ')}
                </button>

                {/* Back button */}
                <button
                  type="button"
                  className="back-button"
                  onClick={backToChoice}
                  disabled={loading}
                >
                  ← ՀԵՏ
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
