import prisma from './prisma';

/**
 * Generates a unique 6-digit application ID
 * Uses a counter-based approach to ensure unique numbers
 */
export async function generateApplicationId(): Promise<string> {
  try {
    // Try to find the latest application to determine the next number
    const latestApp = await prisma.application.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    let nextNumber = 100000; // Start with 100000 to ensure 6 digits

    if (latestApp) {
      // If an application exists, increment the ID
      const latestId = parseInt(latestApp.id, 10);
      if (!isNaN(latestId)) {
        nextNumber = latestId + 1;
      }

      // If we somehow exceed 999999, wrap around to 100000
      if (nextNumber > 999999) {
        nextNumber = 100000;
      }
    }

    // Convert to string and ensure it's exactly 6 digits
    const applicationId = nextNumber.toString();
    
    // Return the ID
    return applicationId;
  } catch (error) {
    console.error('Error generating application ID:', error);
    throw new Error('Failed to generate application ID');
  }
}

/**
 * Checks if an application ID is already in use
 */
export async function isApplicationIdUnique(id: string): Promise<boolean> {
  const existingApp = await prisma.application.findUnique({
    where: { id },
  });
  return !existingApp;
}

/**
 * Ensures a unique 6-digit application ID
 * This handles edge cases where the generated ID might already exist
 */
export async function getUniqueApplicationId(): Promise<string> {
  let applicationId = await generateApplicationId();
  let isUnique = await isApplicationIdUnique(applicationId);
  
  // In the unlikely event of a collision, keep trying until we get a unique ID
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loop
  
  while (!isUnique && attempts < maxAttempts) {
    // Generate a random 6-digit number as a fallback
    const random = Math.floor(100000 + Math.random() * 900000);
    applicationId = random.toString();
    isUnique = await isApplicationIdUnique(applicationId);
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Could not generate a unique application ID after multiple attempts');
  }
  
  return applicationId;
}
