// Debug script to verify Pro tab styling
setTimeout(() => {
  // Find Pro tab buttons
  const proButtons = document.querySelectorAll('.pro-tab-button');
  console.log(`✅ Found ${proButtons.length} Pro tab buttons`);
  
  if (proButtons.length > 0) {
    const first = proButtons[0];
    const computedStyle = window.getComputedStyle(first);
    
    console.log('Pro Tab Button Computed Styles:');
    console.log('- background:', computedStyle.background);
    console.log('- boxShadow:', computedStyle.boxShadow);
    console.log('- animation:', computedStyle.animation);
    console.log('- border:', computedStyle.border);
    
    // Check for pro-tab-label
    const labels = first.querySelectorAll('.pro-tab-label');
    console.log(`✅ Found ${labels.length} Pro tab labels`);
    if (labels.length > 0) {
      const labelStyle = window.getComputedStyle(labels[0]);
      console.log('Pro Tab Label Computed Styles:');
      console.log('- background:', labelStyle.background);
      console.log('- animation:', labelStyle.animation);
      console.log('- color:', labelStyle.color);
    }
    
    // Check for Crown icon
    const crowns = first.querySelectorAll('.pro-crown-icon');
    console.log(`✅ Found ${crowns.length} Crown icons`);
    if (crowns.length > 0) {
      const crownStyle = window.getComputedStyle(crowns[0]);
      console.log('Crown Icon Computed Styles:');
      console.log('- animation:', crownStyle.animation);
      console.log('- filter:', crownStyle.filter);
    }
  } else {
    console.log('❌ No Pro tab buttons found - check if isLocked is being set correctly');
  }
}, 1000);
