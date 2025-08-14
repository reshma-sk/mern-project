export const checkValidData = (fullName, email, password) => {
    if (fullName && fullName.trim() !== "") 
    {
      const isNameValid =
      /(^[A-Za-z]{3,16})([ ]{0,1})([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})/.test(fullName.trim());
      if (!isNameValid) return "Name is not valid";
    }
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) return "Email is not valid";
  
    const isPasswordValid =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password);
    if (!isPasswordValid) return "password is not valid";
    
  
    return null;
};
  