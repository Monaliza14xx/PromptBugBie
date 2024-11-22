// References to UI elements
const promptForm = document.getElementById("promptForm");
const promptInput = document.getElementById("promptInput");
const promptList = document.getElementById("promptList");
const variableEditor = document.getElementById("variableEditor");
const variablesList = document.getElementById("variablesList");
const finalizePrompt = document.getElementById("finalizePrompt");

let selectedPrompt = ""; // Store the selected prompt

// Load prompts from localStorage and display them
function loadPrompts() {
  const prompts = JSON.parse(localStorage.getItem("prompts")) || [];
  promptList.innerHTML = "";
  prompts.forEach((prompt, index) => {
    const listItem = document.createElement("li");
    listItem.className = "prompt-item";

    listItem.innerHTML = `
      <div class="prompt-text">${prompt}</div>
      <div class="button-group">
        <button data-index="${index}" class="btn btn-secondary select-btn">Select</button>
        <button data-index="${index}" class="btn btn-warning edit-btn">Edit</button>
        <button data-index="${index}" class="btn btn-danger delete-btn">Delete</button>
      </div>
    `;
    promptList.appendChild(listItem);
  });
}

// Finalize the prompt with variable values and copy to clipboard
// Finalize the prompt with variable values and copy to clipboard
finalizePrompt.addEventListener("click", () => {
    // Check if there are variable inputs
    const inputs = document.querySelectorAll(".variable-input");
    let finalizedPrompt = selectedPrompt; // Start with the selected prompt
  
    // Replace variables in the prompt with user input values
    inputs.forEach((input) => {
      const variable = input.dataset.variable; // Get the variable name
      const value = input.value.trim(); // Get the user-provided value
      finalizedPrompt = finalizedPrompt.replace(`{${variable}}`, value || `{${variable}}`); // Replace in prompt
    });
  
    // Copy the finalized prompt to the clipboard
    navigator.clipboard.writeText(finalizedPrompt)
      .then(() => {
        // Success feedback
        finalizePrompt.textContent = "Copied!";
        finalizePrompt.style.backgroundColor = "#38a169"; // Green success color
  
        // Display copied content below the button
        let outputMessage = document.getElementById("outputMessage");
        if (!outputMessage) {
          // Create the message div if it doesn't exist
          outputMessage = document.createElement("div");
          outputMessage.id = "outputMessage";
          outputMessage.style.color = "#e2e8f0"; // Light text color
          outputMessage.style.marginTop = "8px";
          outputMessage.style.fontSize = "14px";
          finalizePrompt.parentElement.appendChild(outputMessage); // Add below the Copy Prompt button
        }
        outputMessage.textContent = `Copied Content: "${finalizedPrompt}"`;
  
        // Reset button and remove message after 5 seconds
        setTimeout(() => {
          finalizePrompt.textContent = "Copy Prompt"; // Reset button text
          finalizePrompt.style.backgroundColor = "#63b3ed"; // Reset button color
          outputMessage.textContent = ""; // Clear the copied message
        }, 5000);
  
        console.log("Prompt copied successfully:", finalizedPrompt); // Debugging info
      })
      .catch((err) => {
        console.error("Failed to copy prompt:", err);
        alert("Error: Unable to copy to clipboard. Please try again.");
      });
  });
// Add a new prompt
promptForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newPrompt = promptInput.value.trim(); // Works the same for textarea
  if (newPrompt) {
    const prompts = JSON.parse(localStorage.getItem("prompts")) || [];
    prompts.push(newPrompt);
    localStorage.setItem("prompts", JSON.stringify(prompts));
    loadPrompts();
    promptInput.value = ""; // Clear the textarea after submission
  }
});

// Handle selecting, editing, and deleting prompts
promptList.addEventListener("click", (e) => {
  const index = e.target.dataset.index;
  const prompts = JSON.parse(localStorage.getItem("prompts")) || [];

  // Select Prompt
  if (e.target.classList.contains("select-btn")) {
    selectedPrompt = prompts[index];
    const variables = extractVariables(selectedPrompt);

    if (variables.length > 0) {
      showVariableEditor(variables); // Populate the variable editor
      variableEditor.style.display = "block"; // Show the variable editor
      finalizePrompt.classList.remove("hidden"); // Show the Copy Prompt button
    } else {
      alert("No variables found in the selected prompt.");
      variableEditor.style.display = "none"; // Hide the variable editor
      finalizePrompt.classList.add("hidden"); // Hide the Copy Prompt button
    }
  }

  // Inline Edit Prompt
  if (e.target.classList.contains("edit-btn")) {
    const listItem = e.target.closest(".prompt-item");
    const promptTextDiv = listItem.querySelector(".prompt-text");
    const currentPrompt = prompts[index];

    // Replace the text with a textarea for inline editing
    promptTextDiv.innerHTML = `
      <textarea class="edit-textarea" style="width: 100%; height: 80px; resize: vertical;">${currentPrompt}</textarea>
    `;

    // Replace the Edit button with Save and Cancel buttons
    const buttonGroup = listItem.querySelector(".button-group");
    buttonGroup.dataset.index = index; // Retain the index for the save button
    buttonGroup.innerHTML = `
      <button class="btn btn-success save-btn">Save</button>
      <button class="btn btn-secondary cancel-btn">Cancel</button>
    `;
  }

  // Save Edited Prompt
  if (e.target.classList.contains("save-btn")) {
    const listItem = e.target.closest(".prompt-item");
    const editTextarea = listItem.querySelector(".edit-textarea");
    const index = e.target.closest(".button-group").dataset.index; // Retrieve the index

    const newPrompt = editTextarea.value.trim();

    if (newPrompt) {
      // Update the prompt in the localStorage
      prompts[index] = newPrompt;
      localStorage.setItem("prompts", JSON.stringify(prompts));
      loadPrompts(); // Reload the list to apply changes
    } else {
      alert("Prompt cannot be empty!");
    }
  }

  // Cancel Edit
  if (e.target.classList.contains("cancel-btn")) {
    loadPrompts(); // Reload the list to discard changes
  }

  // Delete Prompt
  if (e.target.classList.contains("delete-btn")) {
    prompts.splice(index, 1);
    localStorage.setItem("prompts", JSON.stringify(prompts));
    loadPrompts();
  }
});

// Extract variables from a prompt
function extractVariables(prompt) {
  const regex = /{([^}]+)}/g;
  const variables = [];
  let match;
  while ((match = regex.exec(prompt)) !== null) {
    variables.push(match[1]);
  }
  return variables;
}

// Show the variable editor
function showVariableEditor(variables) {
  variablesList.innerHTML = ""; // Clear previous variables
  variables.forEach((variable) => {
    const variableItem = document.createElement("div");
    variableItem.className = "variable-item";

    const label = document.createElement("label");
    label.className = "variable-label";
    label.textContent = `${variable}:`;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "variable-input";
    input.dataset.variable = variable;

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "clear-btn";
    clearButton.textContent = "Clear";

    clearButton.addEventListener("click", () => {
      input.value = ""; // Clear input field
    });

    variableItem.appendChild(label);
    variableItem.appendChild(input);
    variableItem.appendChild(clearButton);
    variablesList.appendChild(variableItem);
  });
}

// On load, hide variableEditor
document.addEventListener("DOMContentLoaded", () => {
  loadPrompts();
  variableEditor.style.display = "none"; // Ensure variableEditor is hidden initially
});