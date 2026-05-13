import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Rocket, Crown, Sparkles, Gauge } from 'lucide-react';

const PricingHexagon = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      id: 'starter',
      name: 'STARTER',
      price: '₹49',
      features: ['5 Credits', 'All 6 Modes', 'Basic'],
      icon: <Rocket size={20} />,
      link: 'https://rzp.io/rzp/PIJe05G'
    },
    {
      id: 'growth',
      name: 'GROWTH',
      price: '₹99',
      features: ['15 Credits', 'Unlimited Tabs', 'Priority'],
      icon: <Sparkles size={20} />,
      link: 'https://rzp.io/rzp/b2CTPdO'
    },
    {
      id: 'pro-left',
      name: 'PROFESSIONAL',
      price: '₹249',
      features: ['50 Credits', 'Pro Tabs', 'Export'],
      icon: <Gauge size={20} />,
      link: 'https://rzp.io/rzp/Ge5cJed'
    },
    {
      id: 'featured',
      name: 'PREMIUM',
      price: '₹499',
      duration: '/month',
      features: ['Unlimited', 'All Features', 'VIP'],
      icon: <Crown size={24} />,
      link: 'https://rzp.io/rzp/fOndYoH3',
      featured: true
    },
    {
      id: 'annual',
      name: 'ANNUAL',
      price: '₹4,199',
      duration: '/year',
      features: ['Unlimited', 'Best Value', 'Full Year'],
      icon: <Zap size={20} />,
      link: 'https://rzp.io/rzp/Z66igTvT'
    },
    {
      id: 'free',
      name: 'FREE',
      price: '₹0',
      features: ['10 Gen/Day', '5 Modes', 'Forever'],
      icon: <Rocket size={20} />,
      isFree: true
    },
    {
      id: 'enterprise',
      name: 'ENTERPRISE',
      price: 'Custom',
      features: ['White Label', 'API', 'Dedicated'],
      icon: <Crown size={20} />,
      link: 'mailto:hello@promptquill.com'
    }
  ];

  return (
    <section
      ref={containerRef}
      className="relative w-full py-20 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]"
    >
      {/* Header */}
      <div className="text-center mb-16">
        <motion.h2
          className="text-5xl font-black text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Precision Pricing
        </motion.h2>
        <motion.p
          className="text-gray-400"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Choose your mission
        </motion.p>
      </div>

      {/* Hexagon Grid - All 7 visible */}
      <div className="w-full px-2">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            maxWidth: '1800px',
            margin: '0 auto',
            justifyItems: 'center',
            alignItems: 'start'
          }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.4,
                delay: index * 0.06,
                type: 'spring',
                stiffness: 100
              }}
              className="w-full h-full"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Hexagon Card */}
              <motion.div
                whileHover={{ scale: plan.featured ? 1 : 1.05 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  width: plan.featured ? '300px' : '260px',
                  height: plan.featured ? '300px' : '260px',
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                  background: 'linear-gradient(135deg, rgba(147,51,234,0.2), rgba(59,130,246,0.1))',
                  border: hoveredIndex === index ? '2px solid rgba(163, 230, 53, 0.8)' : '1px solid rgba(163, 230, 53, 0.3)',
                  boxShadow: hoveredIndex === index
                    ? '0 0 40px rgba(163, 230, 53, 0.5), inset 0 0 20px rgba(163, 230, 53, 0.1)'
                    : '0 0 20px rgba(163, 230, 53, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Featured Badge */}
                {plan.featured && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      background: 'linear-gradient(135deg, #a3e635, #b3d435)',
                      color: '#000',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '900',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Icon */}
                <motion.div
                  animate={hoveredIndex === index ? { scale: 1.2 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: '#fbbf24', marginBottom: '6px' }}
                >
                  {plan.icon}
                </motion.div>

                {/* Name */}
                <h3 style={{
                  fontSize: plan.featured ? '12px' : '11px',
                  fontWeight: '900',
                  color: 'white',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div style={{
                  fontSize: plan.featured ? '24px' : '22px',
                  fontWeight: '900',
                  background: 'linear-gradient(to right, #fcd34d, #fde047)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '4px'
                }}>
                  {plan.price}
                </div>

                {plan.duration && (
                  <div style={{
                    fontSize: '9px',
                    color: 'rgb(209, 213, 219)',
                    marginBottom: '6px'
                  }}>
                    {plan.duration}
                  </div>
                )}

                {/* Features */}
                <div style={{
                  fontSize: '9px',
                  color: 'rgb(229, 231, 235)',
                  lineHeight: '1.4',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  marginBottom: '6px'
                }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ whiteSpace: 'nowrap' }}>✓ {f}</div>
                  ))}
                </div>

                {/* Button */}
                {!plan.isFree && (
                  <motion.a
                    href={plan.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '50px',
                      fontSize: '10px',
                      fontWeight: '700',
                      color: 'white',
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Choose <ArrowRight size={10} />
                  </motion.a>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Text */}
      <motion.p
        className="text-center text-gray-400 text-sm mt-12"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        All plans include core features. Upgrade anytime.
      </motion.p>
    </section>
  );
};

export default PricingHexagon;
