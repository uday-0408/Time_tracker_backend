import ReportTemplate, { DEFAULT_TEMPLATES, IReportTemplate } from '../models/ReportTemplate.js';

export class TemplateService {
  /**
   * Get all templates for a user. Seeds defaults on first access.
   */
  static async getTemplates(userId: string) {
    let templates = await ReportTemplate.find({ userId }).sort({ isDefault: -1, createdAt: 1 });

    if (templates.length === 0) {
      const docs = DEFAULT_TEMPLATES.map((t) => ({ ...t, userId }));
      await ReportTemplate.insertMany(docs);
      templates = await ReportTemplate.find({ userId }).sort({ isDefault: -1, createdAt: 1 });
    }

    return templates;
  }

  /**
   * Get a single template by ID
   */
  static async getTemplate(templateId: string, userId: string) {
    const template = await ReportTemplate.findOne({ _id: templateId, userId });
    if (!template) throw new Error('Template not found');
    return template;
  }

  /**
   * Create a custom template
   */
  static async createTemplate(
    userId: string,
    name: string,
    sections: { key: string; label: string; type: string; placeholder?: string; order: number }[]
  ) {
    const template = await ReportTemplate.create({
      userId,
      name: name.trim(),
      type: 'custom',
      isDefault: false,
      sections,
    });
    return template;
  }

  /**
   * Update a template (only custom templates can be updated)
   */
  static async updateTemplate(
    templateId: string,
    userId: string,
    updates: {
      name?: string;
      sections?: { key: string; label: string; type: string; placeholder?: string; order: number }[];
    }
  ) {
    const template = await ReportTemplate.findOne({ _id: templateId, userId });
    if (!template) throw new Error('Template not found');

    if (updates.name !== undefined) template.name = updates.name;
    if (updates.sections !== undefined) template.sections = updates.sections as any;

    await template.save();
    return template;
  }

  /**
   * Delete a custom template (default templates cannot be deleted)
   */
  static async deleteTemplate(templateId: string, userId: string) {
    const template = await ReportTemplate.findOne({ _id: templateId, userId });
    if (!template) throw new Error('Template not found');
    if (template.isDefault) throw new Error('Cannot delete default templates');
    await ReportTemplate.deleteOne({ _id: templateId });
    return template;
  }
}
