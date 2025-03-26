import brevo from "@getbrevo/brevo";

export const sendReminderEmailToClient15DaysInterval = async (params) => {
  try {
    // Set up Brevo client
    let defaultClient = brevo.ApiClient.instance;
    let apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_KEY_V3;
    let apiInstance = new brevo.TransactionalEmailsApi();

    let sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: "EPCORN",
      email: process.env.MY_EMAIL,
    };

    sendSmtpEmail.to = [{ email: process.env.MY_EMAIL }];
    sendSmtpEmail.params = params;

    sendSmtpEmail.templateId = 18;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error("Error in generate and send report:", error);
    throw new Error("Failed to generate and send report");
  }
};
