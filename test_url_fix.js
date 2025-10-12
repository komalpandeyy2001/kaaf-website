const validateAndFixImageUrl = (imageUrl) => {
  // Check if it's a Firebase Storage URL
  if (imageUrl.includes("firebasestorage.googleapis.com")) {
    // Fix for complex double extension issues (e.g., .png0.95026716722585.jpg)
    const urlParts = imageUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    console.log('Original last part:', lastPart);
    
    // Handle complex patterns like .png0.95026716722585.jpg
    const complexPatternMatch = lastPart.match(/^([^?]*)(\.[a-zA-Z0-9]+)(\d+\.\d+)(\.[a-zA-Z]+)(\?.*)?$/);
    if (complexPatternMatch && complexPatternMatch[2] && complexPatternMatch[4]) {
      console.log('Complex pattern match:', complexPatternMatch);
      // Keep only the base filename and the last extension
      const correctedLastPart = complexPatternMatch[1] + complexPatternMatch[4] + (complexPatternMatch[5] || '');
      urlParts[urlParts.length - 1] = correctedLastPart;
      return urlParts.join('/');
    }
    
    // Fix for simple double extension issue (e.g., .png.jpg)
    const doubleExtMatch = lastPart.match(/^([^?]*)(\.[^.]+)(\.[^.]+)(\?.*)?$/);
    if (doubleExtMatch && doubleExtMatch[2] && doubleExtMatch[3]) {
      console.log('Double extension match:', doubleExtMatch);
      // Keep only the last extension
      const correctedLastPart = doubleExtMatch[1] + doubleExtMatch[3] + (doubleExtMatch[4] || '');
      urlParts[urlParts.length - 1] = correctedLastPart;
      return urlParts.join('/');
    }
  }
  
  return imageUrl;
};

// Test with the actual URLs from console
const testUrls = [
  "https://firebasestorage.googleapis.com/v0/b/kaaf-web.firebasestorage.app/o/images%2FRectangle%205.png0.95026716722585.jpg?alt=media&token=7895a5a0-65cd-46a5-a598-fb672b158513",
  "https://firebasestorage.googleapis.com/v0/b/kaaf-web.firebasestorage.app/o/images%2FRectangle%205.png0.20106260912345197.jpg?alt=media&token=b585db34-88b7-4eba-832c-43554b54d6cd"
];

testUrls.forEach(url => {
  console.log('\nOriginal URL:', url);
  const fixed = validateAndFixImageUrl(url);
  console.log('Fixed URL:', fixed);
  console.log('URLs are equal:', url === fixed);
});
