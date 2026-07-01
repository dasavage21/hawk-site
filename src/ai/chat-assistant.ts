export interface Message {
  role: "bot" | "user";
  content: string;
}

export interface ConversationState {
  step: "greeting" | "asking_service" | "asking_urgency" | "asking_name" | "asking_email" | "asking_phone" | "done";
  collected: {
    service?: string;
    urgency?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

const industryGreetings: Record<string, string> = {
  plumber: "Hi! 💧 Need a plumber? I can help you get a quick estimate. What plumbing service do you need?",
  roofer: "Hi! 🏠 Need roofing help? I can connect you with a professional. What roofing service are you looking for?",
  hvac: "Hi! ❄️ Need heating or AC service? I can help you book a service call. What HVAC issue are you having?",
  heating: "Hi! ❄️ Need heating or AC service? I can help you book a service call. What HVAC issue are you having?",
  cooling: "Hi! ❄️ Need heating or AC service? I can help you book a service call. What HVAC issue are you having?",
  dentist: "Hi! 🦷 Looking for dental care? I can help you schedule an appointment. What dental service do you need?",
  dental: "Hi! 🦷 Looking for dental care? I can help you schedule an appointment. What dental service do you need?",
  electrician: "Hi! ⚡ Need an electrician? I can help you get a quick quote. What electrical work do you need?",
  electrical: "Hi! ⚡ Need an electrician? I can help you get a quick quote. What electrical work do you need?",
  landscaper: "Hi! 🌿 Need landscaping help? I can help you plan your project. What landscaping service are you interested in?",
  landscaping: "Hi! 🌿 Need landscaping help? I can help you plan your project. What landscaping service are you interested in?",
  lawn: "Hi! 🌿 Need landscaping help? I can help you plan your project. What landscaping service are you interested in?",
};

const defaultGreeting = "Hi! 👋 Thanks for reaching out! How can I help you today?";

export function getGreeting(industry: string): string {
  const key = industry.toLowerCase().trim();
  return industryGreetings[key] || defaultGreeting;
}

export function getNextStep(state: ConversationState): string {
  const { step } = state;

  switch (step) {
    case "greeting":
    case "asking_service":
      return "Great! When do you need this done? (Immediately, This week, Next month, Just exploring)";
    case "asking_urgency":
      return "Thanks! What's your name?";
    case "asking_name":
      return "Nice to meet you! What's your email address?";
    case "asking_email":
      return "And your phone number?";
    case "asking_phone":
      return "Perfect! We'll have someone reach out to you shortly. You can also call us directly for faster service. 📞";
    case "done":
      return "Thanks for chatting with us! If you need anything else, feel free to start a new conversation.";
    default:
      return "How can I help you?";
  }
}

export function processUserInput(state: ConversationState, input: string): { state: ConversationState; response: string; leadCaptured: boolean } {
  const trimmed = input.trim();
  const newState = { ...state };
  let response = "";
  let leadCaptured = false;

  switch (state.step) {
    case "greeting":
    case "asking_service":
      newState.collected = { ...newState.collected, service: trimmed };
      newState.step = "asking_urgency";
      response = getNextStep(newState);
      break;

    case "asking_urgency":
      newState.collected = { ...newState.collected, urgency: trimmed };
      newState.step = "asking_name";
      response = getNextStep(newState);
      break;

    case "asking_name":
      newState.collected = { ...newState.collected, name: trimmed };
      newState.step = "asking_email";
      response = getNextStep(newState);
      break;

    case "asking_email":
      newState.collected = { ...newState.collected, email: trimmed };
      newState.step = "asking_phone";
      response = getNextStep(newState);
      break;

    case "asking_phone":
      newState.collected = { ...newState.collected, phone: trimmed };
      newState.step = "done";
      newState.status = "qualified";
      response = getNextStep(newState);
      leadCaptured = true;
      break;

    case "done":
      response = getNextStep(newState);
      break;

    default:
      newState.step = "asking_service";
      response = getNextStep(newState);
  }

  return { state: newState, response, leadCaptured };
}

export function createInitialState(): ConversationState {
  return {
    step: "greeting",
    collected: {},
  };
}

export function serializeMessages(messages: Message[]): string {
  return JSON.stringify(messages);
}

export function deserializeMessages(json: string): Message[] {
  try {
    return JSON.parse(json) as Message[];
  } catch {
    return [];
  }
}