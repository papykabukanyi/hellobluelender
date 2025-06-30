// Simple database check for leads
import redis from './src/lib/redis.js';

async function checkLeadsInDatabase() {
  try {
    console.log('🔍 Checking leads in Redis database...\n');
    
    // Check for all chat leads
    const chatLeadKeys = await redis.keys('chat:lead:*');
    console.log(`📊 Found ${chatLeadKeys.length} chat lead keys:`);
    chatLeadKeys.forEach(key => console.log(`   - ${key}`));
    
    // Check for pre-application keys
    const preAppKeys = await redis.keys('pre-application:*');
    console.log(`\n📊 Found ${preAppKeys.length} pre-application keys:`);
    preAppKeys.forEach(key => console.log(`   - ${key}`));
    
    // Check leads set
    const leadsInSet = await redis.smembers('leads');
    console.log(`\n📊 Found ${leadsInSet.length} leads in the 'leads' set:`);
    leadsInSet.forEach(leadId => console.log(`   - ${leadId}`));
    
    // Check pre-applications set
    const preAppsInSet = await redis.smembers('pre-applications');
    console.log(`\n📊 Found ${preAppsInSet.length} pre-applications in the 'pre-applications' set:`);
    preAppsInSet.forEach(preAppId => console.log(`   - ${preAppId}`));
    
    // Sample a few lead entries
    if (chatLeadKeys.length > 0) {
      console.log('\n🔍 Sample lead data:');
      for (let i = 0; i < Math.min(3, chatLeadKeys.length); i++) {
        const leadData = await redis.get(chatLeadKeys[i]);
        if (leadData) {
          const parsed = JSON.parse(leadData);
          console.log(`\n   ${chatLeadKeys[i]}:`);
          console.log(`     Name: ${parsed.name || parsed.firstName + ' ' + parsed.lastName}`);
          console.log(`     Email: ${parsed.email}`);
          console.log(`     Source: ${parsed.source}`);
          console.log(`     Priority: ${parsed.priority}`);
        }
      }
    }
    
    await redis.disconnect();
    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    await redis.disconnect();
  }
}

checkLeadsInDatabase();
