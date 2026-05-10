import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';
import baldHeadImage from '../../assets/bald_head.png'; 

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        
        <div className={styles.content}>
          <span className={styles.badge}>Next-Gen Trichology</span>
          <h1 className={styles.title}>
            Clinical Hair Analysis <br/>
            Through <span>Deep Learning</span>
          </h1>
          <p className={styles.description}>
            Transforming scalp diagnostics with automated follicle detection, 
            density mapping, and growth tracking. Built for professionals, 
            accessible to everyone.
          </p>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
            {/* Primary Action */}
            <button 
              onClick={() => navigate('/signup')} 
              className={styles.btnPrimary}
            >
              Get Started
            </button>
            
            {/* Secondary Action routing to your standalone page */}
            <button 
              onClick={() => navigate('/methodology')} 
              className={styles.btnPrimary} 
              style={{ 
                background: 'transparent', 
                color: '#2563eb', 
                border: '2px solid #2563eb',
                boxShadow: 'none'
              }}
            >
              View Methodology
            </button>
          </div>
        </div>
        
        <div className={styles.imageWrapper}>
          <img src={baldHeadImage} alt="Scalp Analysis" className={styles.baldImage} />
          <div className={styles.scanOverlay}>
            <div className={styles.scanningLine}></div>
          </div>
        </div>

      </div>
    </section>
  );
}