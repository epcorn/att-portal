import brevo from "@getbrevo/brevo";

function setUpBrevo(sender, to, params, templateId, attachment) {
  let defaultClient = brevo.ApiClient.instance;
  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_KEY;
  let apiInstance = new brevo.TransactionalEmailsApi();

  let sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = sender;
  sendSmtpEmail.to = to;
  sendSmtpEmail.params = params;
  sendSmtpEmail.templateId = templateId;
  sendSmtpEmail.attachment = attachment;
  return apiInstance;
}

export default setUpBrevo;
