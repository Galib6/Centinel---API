import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as path from "path";

export interface EmailTemplateContext {
  [key: string]: any;
}

@Injectable()
export class EmailTemplateHelper {
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.join(process.cwd(), "views", "emails");
  }

  /**
   * Renders an email template with the provided context
   * @param templateName - Name of the template file (without .hbs extension)
   * @param context - Data to be injected into the template
   * @returns Rendered HTML string
   */
  async renderTemplate(
    templateName: string,
    context: EmailTemplateContext
  ): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);

      // Check if template file exists
      if (!fs.existsSync(templatePath)) {
        throw new Error(
          `Email template '${templateName}' not found at ${templatePath}`
        );
      }

      // Read template file
      const templateSource = fs.readFileSync(templatePath, "utf8");

      // Compile template
      const template = handlebars.compile(templateSource);

      // Add common context variables
      const enrichedContext = {
        ...context,
        currentYear: new Date().getFullYear(),
        appName: context.appName || "Meet API",
      };

      // Render template with context
      return template(enrichedContext);
    } catch (error) {
      throw new Error(
        `Failed to render email template '${templateName}': ${error.message}`
      );
    }
  }

  /**
   * Registers custom Handlebars helpers
   */
  registerHelpers(): void {
    // Helper to format dates
    handlebars.registerHelper(
      "formatDate",
      function (date: Date, format: string) {
        if (!date) return "";

        const options: Intl.DateTimeFormatOptions = {};

        switch (format) {
          case "short":
            options.year = "numeric";
            options.month = "short";
            options.day = "numeric";
            break;
          case "long":
            options.year = "numeric";
            options.month = "long";
            options.day = "numeric";
            options.weekday = "long";
            break;
          case "time":
            options.hour = "2-digit";
            options.minute = "2-digit";
            break;
          default:
            options.year = "numeric";
            options.month = "2-digit";
            options.day = "2-digit";
        }

        return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
      }
    );

    // Helper to capitalize text
    handlebars.registerHelper("capitalize", function (text: string) {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    });

    // Helper for conditional rendering
    handlebars.registerHelper(
      "ifEquals",
      function (a: any, b: any, options: any) {
        if (a === b) {
          return options.fn(this);
        }
        return options.inverse(this);
      }
    );

    // Helper to join arrays
    handlebars.registerHelper(
      "join",
      function (array: any[], separator: string) {
        if (!Array.isArray(array)) return "";
        return array.join(separator || ", ");
      }
    );
  }

  /**
   * Validates if a template exists
   * @param templateName - Name of the template to check
   * @returns True if template exists
   */
  templateExists(templateName: string): boolean {
    const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
    return fs.existsSync(templatePath);
  }
}
