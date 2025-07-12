import createShopsTable from "./shops";
import createCategoriesTable from "./categories";
import createUserTable from "./user";
import createProductTable from "./product";
import createDesignStylesTable from "./design_styles";
import createCurrenciesTable from "./currencies";
import createEmailTemplatesTable from "./email_templates";
import createOrdersTable from "./orders";
import createAdminTable from "./admin";
import createAdminEmailsTable from "./admins_emails";
import createEmailLogsTable from "./email_logs";
import createGeneralTable from "./general";
import createBlogsTable from "./blogs";
import createFAQsTable from "./faqs";
import createAffiliateSettingsTable from "./affiliate_settings";

(async (): Promise<void> => {
  try {
    await createShopsTable();
    await createCategoriesTable();
    await createUserTable();
    await createAffiliateSettingsTable();
    await createGeneralTable();
    await createEmailLogsTable();
    await createAdminEmailsTable();
    await createAdminTable();
    await createProductTable();
    await createDesignStylesTable();
    await createOrdersTable();
    await createEmailTemplatesTable();
    await createCurrenciesTable();
    await createFAQsTable();
    await createBlogsTable();

    console.log("Tables created successfully.");
    process.exit(0);
  } catch (err: any) {
    console.error("Failed to create tables:", err?.message || err);
    process.exit(1);
  }
})();
