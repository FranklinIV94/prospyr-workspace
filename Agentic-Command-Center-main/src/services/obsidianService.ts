export class ObsidianService {
  private static instance: ObsidianService;

  private constructor() {}

  static getInstance() {
    if (!ObsidianService.instance) {
      ObsidianService.instance = new ObsidianService();
    }
    return ObsidianService.instance;
  }

  async saveNote(filepath: string, content: string, config: { ip: string; port: string; token: string }) {
    const url = `http://${config.ip}:${config.port}/vault/${filepath}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'text/markdown',
        },
        body: content,
      });

      if (!response.ok) {
        throw new Error(`Obsidian API error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to save to Obsidian:', error);
      return false;
    }
  }
}

export const obsidianService = ObsidianService.getInstance();
