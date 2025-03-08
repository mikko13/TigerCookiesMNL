import { backendURL } from "../../../urls/URL";

export const handleSubmitForm = async (formData, profilePicture, setToast) => {
  const form = new FormData();
  for (const key in formData) {
    form.append(key, formData[key]);
  }
  if (profilePicture) {
    form.append("profilePicture", profilePicture);
  }

  // Determine endpoint and success message based on role (default to "employee")
  const role = formData.role ? formData.role.toLowerCase() : "employee";
  const endpoint = role === "admin" ? "admins" : "employees";
  const successMessage =
    role === "admin"
      ? "Admin account created successfully!"
      : "Employee account created successfully!";

  try {
    const response = await fetch(`${backendURL}/api/${endpoint}`, {
      method: "POST",
      body: form,
    });

    if (response.ok) {
      const data = await response.json();
      setToast({ type: "success", message: successMessage });
      return data;
    } else {
      const errorData = await response.json();
      setToast({ type: "error", message: `Error: ${errorData.message}` });
    }
  } catch (error) {
    setToast({ type: "error", message: `Error: ${error.message}` });
  }
};
