import redis from '../src/lib/redis.js';

async function checkRedisKeys() {
  try {
    console.log('🔍 Checking Redis keys for leads...\n');
    
    // Check for all chat lead keys
    const chatLeadKeys = await redis.keys('chat:lead:*');
    console.log(`📊 Found ${chatLeadKeys.length} chat:lead keys:`);
    chatLeadKeys.forEach(key => console.log(`   - ${key}`));
    
    // Check for pre-application keys
    const preAppKeys = await redis.keys('pre-application:*');
    console.log(`\n📊 Found ${preAppKeys.length} pre-application keys:`);
    preAppKeys.forEach(key => console.log(`   - ${key}`));
    
    // Check leads set
    const leadsSet = await redis.smembers('leads');
    console.log(`\n📊 Leads set contains ${leadsSet.length} items:`);
    leadsSet.forEach(id => console.log(`   - ${id}`));
    
    // Sample lead data
    if (chatLeadKeys.length > 0) {
      console.log('\n🔍 Sample lead data:');
      const sampleKey = chatLeadKeys[0];
      const sampleData = await redis.get(sampleKey);
      console.log(`   ${sampleKey}:`);
      console.log(`   ${sampleData}`);
    }
    
    await redis.quit();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await redis.quit();
  }
}

checkRedisKeys();
