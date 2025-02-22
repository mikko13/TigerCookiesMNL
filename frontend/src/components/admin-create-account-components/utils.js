import { backendURL } from "../../urls/URL";

export const handleSubmitForm = async (formData, profilePicture, setToast) => {
  const form = new FormData();
  for (const key in formData) {
    form.append(key, formData[key]);
  }
  if (profilePicture) {
    form.append("profilePicture", profilePicture);
  }

  try {
    const response = await fetch(`${backendURL}/api/employees`, {
      method: "POST",
      body: form,
    });

    if (response.ok) {
      const data = await response.json();
      setToast({ type: "success", message: "Account created successfully!" });
      return data;
    } else {
      const errorData = await response.json();
      setToast({ type: "error", message: `Error: ${errorData.message}` });
    }
  } catch (error) {
    setToast({ type: "error", message: `Error: ${error.message}` });
  }
};
