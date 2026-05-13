import React from 'react';

export const PageLoadingSkeleton = ({ variant = 'full' }) => {
  if (variant === 'full') {
    return (
      <div style={{ height: '100vh', display: 'flex', backgroundColor: '#080808', color: '#fff', overflow: 'hidden' }}>
        {/* Sidebar Skeleton */}
        <div style={{ width: '280px', backgroundColor: '#0a0a0a', borderRight: '1px solid #111', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
          <div className="skeleton" style={{ height: '20px', width: '120px', marginBottom: '32px', borderRadius: '8px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="skeleton" style={{ height: '40px', borderRadius: '10px' }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: '40px', borderRadius: '10px', marginTop: '32px' }} />
        </div>

        {/* Main Content Skeleton */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top Bar */}
          <div style={{ padding: '20px 40px', borderBottom: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
              <div className="skeleton" style={{ height: '32px', width: '200px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '32px', width: '250px', borderRadius: '8px' }} />
            </div>
            <div className="skeleton" style={{ height: '32px', width: '100px', borderRadius: '8px' }} />
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '40px' }}>
              <div className="skeleton" style={{ height: '36px', width: '300px', marginBottom: '16px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '18px', width: '500px', borderRadius: '6px' }} />
            </div>

            {/* Tabs Skeleton */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #111' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton" style={{ height: '36px', width: '100px', borderRadius: '8px' }} />
              ))}
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '24px' }}>
                  <div className="skeleton" style={{ height: '24px', width: '150px', marginBottom: '16px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '12px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ height: '16px', width: '90%', marginBottom: '12px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ height: '16px', width: '70%', borderRadius: '6px' }} />
                </div>
              ))}
            </div>

            {/* List Skeleton */}
            <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ height: '14px', flex: 1, borderRadius: '6px', marginRight: '16px' }} />
                ))}
              </div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ padding: '20px 24px', borderBottom: i < 5 ? '1px solid #1a1a1a' : 'none', display: 'flex', gap: '16px' }}>
                  <div className="skeleton" style={{ height: '16px', width: '200px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ height: '16px', flex: 1, borderRadius: '6px' }} />
                  <div className="skeleton" style={{ height: '16px', width: '100px', borderRadius: '6px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Loading Indicator */}
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#111', border: '1px solid #1a1a1a', padding: '12px 20px', borderRadius: '12px', zIndex: 1000 }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#a3e635', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Loading content...</span>
        </div>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div style={{ minHeight: '100vh', padding: '40px', backgroundColor: '#080808', color: '#fff' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div className="skeleton" style={{ height: '36px', width: '300px', marginBottom: '16px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ height: '18px', width: '500px', borderRadius: '6px' }} />
        </div>

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <div className="skeleton" style={{ height: '200px', width: '100%', marginBottom: '16px', borderRadius: '12px' }} />
              <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '12px', borderRadius: '6px' }} />
              <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '8px', borderRadius: '6px' }} />
              <div className="skeleton" style={{ height: '16px', width: '60%', borderRadius: '6px' }} />
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#111', border: '1px solid #1a1a1a', padding: '12px 20px', borderRadius: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#db2777', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div style={{ minHeight: '100vh', padding: '40px', backgroundColor: '#080808', color: '#fff' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div className="skeleton" style={{ height: '28px', width: '250px', marginBottom: '12px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ height: '16px', width: '400px', borderRadius: '6px' }} />
        </div>

        {/* List Items */}
        <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: '16px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: '14px', flex: 1, borderRadius: '6px' }} />
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} style={{ padding: '20px 24px', borderBottom: i < 7 ? '1px solid #1a1a1a' : 'none', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="skeleton" style={{ height: '40px', width: '40px', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: '16px', width: '200px', marginBottom: '8px', borderRadius: '6px' }} />
                <div className="skeleton" style={{ height: '12px', width: '150px', borderRadius: '6px' }} />
              </div>
              <div className="skeleton" style={{ height: '20px', width: '80px', borderRadius: '6px' }} />
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#111', border: '1px solid #1a1a1a', padding: '12px 20px', borderRadius: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
            <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '12px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '8px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ height: '16px', width: '90%', borderRadius: '6px' }} />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default PageLoadingSkeleton;
