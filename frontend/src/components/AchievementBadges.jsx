import React, { useState } from 'react';
import { Trophy, Lock, Zap, TrendingUp } from 'lucide-react';

/**
 * AchievementBadges Component - Display user achievements
 * Props:
 * - achievements: Array of unlocked achievement objects
 * - size: 'sm' (32px), 'md' (48px), 'lg' (64px) - default 'md'
 * - layout: 'grid' (auto-fill), 'row' (flex), 'compact' (tight grid) - default 'grid'
 * - showLabels: Boolean - show achievement names and descriptions
 * - interactive: Boolean - show hover tooltips
 * - maxDisplay: Number - max achievements to show (default unlimited)
 */
export const AchievementBadges = ({
  achievements = [],
  size = 'md',
  layout = 'grid',
  showLabels = false,
  interactive = true,
  maxDisplay = null
}) => {
  const [hoveredId, setHoveredId] = useState(null);

  const sizeMap = {
    sm: { container: '32px', fontSize: '16px' },
    md: { container: '48px', fontSize: '24px' },
    lg: { container: '64px', fontSize: '32px' }
  };

  const dim = sizeMap[size];
  const displayAchievements = maxDisplay ? achievements.slice(0, maxDisplay) : achievements;
  const hiddenCount = maxDisplay && achievements.length > maxDisplay ? achievements.length - maxDisplay : 0;

  const containerStyle = {
    grid: { display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${dim.container}, 1fr))`, gap: '12px' },
    row: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    compact: { display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${dim.container}, 1fr))`, gap: '4px' }
  }[layout];

  return (
    <div style={containerStyle}>
      {displayAchievements.map((achievement) => (
        <div
          key={achievement.id}
          style={{ position: 'relative' }}
          onMouseEnter={() => interactive && setHoveredId(achievement.id)}
          onMouseLeave={() => interactive && setHoveredId(null)}
        >
          {/* Badge */}
          <div
            style={{
              width: dim.container,
              height: dim.container,
              borderRadius: '50%',
              backgroundColor: `${achievement.color}20`,
              border: `2px solid ${achievement.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: dim.fontSize,
              cursor: interactive ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              transform: hoveredId === achievement.id ? 'scale(1.1)' : 'scale(1)',
              boxShadow: hoveredId === achievement.id ? `0 0 15px ${achievement.color}60` : 'none',
            }}
          >
            {achievement.icon}
          </div>

          {/* Tooltip with Tasks */}
          {interactive && hoveredId === achievement.id && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#111',
                border: `2px solid ${achievement.color}`,
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '12px',
                minWidth: '220px',
                zIndex: 1000,
                fontSize: '12px',
                fontWeight: '600',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
              }}
            >
              <div style={{ fontWeight: '900', marginBottom: '6px', color: achievement.color }}>
                {achievement.name}
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px', lineHeight: '1.4' }}>
                {achievement.description}
              </div>
              {achievement.tasks && achievement.tasks.length > 0 && (
                <div style={{ borderTop: `1px solid ${achievement.color}40`, paddingTop: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Tasks:</div>
                  {achievement.tasks.map((task, idx) => (
                    <div key={idx} style={{ fontSize: '11px', color: '#ccc', marginBottom: '3px', paddingLeft: '12px' }}>
                      • {task}
                    </div>
                  ))}
                </div>
              )}
              {achievement.reward && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${achievement.color}40`, fontSize: '11px', color: achievement.color, fontWeight: '700' }}>
                  {achievement.reward}
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${achievement.color}`
              }} />
            </div>
          )}
        </div>
      ))}

      {/* +N more pill */}
      {hiddenCount > 0 && (
        <div
          style={{
            width: dim.container,
            height: dim.container,
            borderRadius: '50%',
            backgroundColor: '#222',
            border: '2px dashed #444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '700',
            color: '#666',
            cursor: 'default'
          }}
        >
          +{hiddenCount}
        </div>
      )}
    </div>
  );
};

/**
 * AchievementShowcase - Full detailed achievement display with stats
 * Props:
 * - achievements: Array of unlocked achievements
 * - totalAchievements: Total possible achievements
 * - nextAchievement: Next achievement with progress info
 */
export const AchievementShowcase = ({
  achievements = [],
  totalAchievements = 20,
  nextAchievement = null
}) => {
  const unlockedCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalAchievements) * 100);

  return (
    <div style={{ borderRadius: '16px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', padding: '32px', marginBottom: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Trophy size={32} color="#a3e635" />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '4px' }}>Achievements</h2>
          <p style={{ fontSize: '13px', color: '#666' }}>
            {unlockedCount} of {totalAchievements} unlocked
          </p>
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: '900',
          color: '#a3e635',
          textAlign: 'center'
        }}>
          {progressPercent}%
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#111',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: 'linear-gradient(90deg, #a3e635, #6d28d9)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Achievements Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {achievements.map((ach) => (
          <div
            key={ach.id}
            style={{
              padding: '16px',
              backgroundColor: '#111',
              border: `2px solid ${ach.color}40`,
              borderRadius: '12px',
              textAlign: 'center',
              transition: '0.3s',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${ach.color}99`;
              e.currentTarget.style.backgroundColor = "#0a0a0a";
              e.currentTarget.style.boxShadow = `0 0 16px ${ach.color}40`;
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${ach.color}40`;
              e.currentTarget.style.backgroundColor = '#111';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{ach.icon}</div>
            <p style={{ fontSize: '13px', fontWeight: '800', color: ach.color, marginBottom: '6px' }}>{ach.name}</p>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '12px', lineHeight: '1.4' }}>{ach.description}</p>
            
            {/* Tasks */}
            {ach.tasks && ach.tasks.length > 0 && (
              <div style={{
                borderTop: `1px solid ${ach.color}20`,
                paddingTop: '10px',
                marginTop: '10px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '700' }}>
                  📋 To Unlock:
                </div>
                {ach.tasks.map((task, idx) => (
                  <div key={idx} style={{ fontSize: '10px', color: '#aaa', marginBottom: '3px', paddingLeft: '8px', lineHeight: '1.3' }}>
                    ✓ {task}
                  </div>
                ))}
              </div>
            )}

            {/* Reward */}
            {ach.reward && (
              <div style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: `1px solid ${ach.color}20`,
                fontSize: '10px',
                color: ach.color,
                fontWeight: '700',
                background: `${ach.color}10`,
                padding: '6px 8px',
                borderRadius: '6px'
              }}>
                🎁 {ach.reward}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Next Achievement */}
      {nextAchievement && (
        <div style={{
          padding: '16px',
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '32px' }}>🎯</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>NEXT ACHIEVEMENT</p>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>{nextAchievement.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '4px', backgroundColor: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${nextAchievement.progress}%`,
                  backgroundColor: '#a3e635',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#666' }}>
                {nextAchievement.current} / {nextAchievement.target}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;
