// Content loader for offline/bundled content
// This loads modules and quizzes from the bundled JSON files

export interface ModuleContent {
  id: string;
  title: string;
  description?: string;
  items: any[];
}

export interface QuizContent {
  moduleId: string;
  questions: any[];
}

class ContentLoader {
  private moduleCache: Map<string, any> = new Map();
  private quizCache: Map<string, any> = new Map();

  /**
   * Get module content from bundled JSON
   */
  async getModule(moduleId: string): Promise<any> {
    // Check cache first
    if (this.moduleCache.has(moduleId)) {
      return this.moduleCache.get(moduleId);
    }

    try {
      let moduleData;
      
      // Load from bundled files
      switch (moduleId) {
        case '01':
        case '1':
          moduleData = require('../../content/modules/01_alphabet.json');
          break;
        case '02':
        case '2':
          moduleData = require('../../content/modules/02_sounds.json');
          break;
        case '03':
        case '3':
          moduleData = require('../../content/modules/03_mathematics.json');
          break;
        case '04':
        case '4':
          moduleData = require('../../content/modules/04_family.json');
          break;
        case '05':
        case '5':
          moduleData = require('../../content/modules/05_write.json');
          break;
        case '06':
        case '6':
          moduleData = require('../../content/modules/06_i_know_how_to_read.json');
          break;
        case '07':
        case '7':
          moduleData = require('../../content/modules/07_complete.json');
          break;
        case '08':
        case '8':
          moduleData = require('../../content/modules/08_words.json');
          break;
        case '09':
        case '9':
          moduleData = require('../../content/modules/09_festivals.json');
          break;
        case '10':
          moduleData = require('../../content/modules/10_colors.json');
          break;
        default:
          throw new Error(`Module ${moduleId} not found`);
      }

      // Cache it
      this.moduleCache.set(moduleId, moduleData);
      return moduleData;
    } catch (error) {
      console.error(`Error loading module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Get quiz content from bundled JSON
   */
  async getQuiz(moduleId: string): Promise<any> {
    // Check cache first
    if (this.quizCache.has(moduleId)) {
      return this.quizCache.get(moduleId);
    }

    try {
      let quizData;
      
      // Load from bundled files
      switch (moduleId) {
        case '01':
        case '1':
          quizData = require('../../content/quizzes/quiz_01_alphabet.json');
          break;
        case '02':
        case '2':
          quizData = require('../../content/quizzes/quiz_02_sounds.json');
          break;
        case '03':
        case '3':
          quizData = require('../../content/quizzes/quiz_03_mathematics.json');
          break;
        case '04':
        case '4':
          quizData = require('../../content/quizzes/quiz_04_family.json');
          break;
        case '05':
        case '5':
          quizData = require('../../content/quizzes/quiz_05_write.json');
          break;
        case '06':
        case '6':
          quizData = require('../../content/quizzes/quiz_06_i_know_how_to_read.json');
          break;
        case '07':
        case '7':
          quizData = require('../../content/quizzes/quiz_07_complete.json');
          break;
        case '08':
        case '8':
          quizData = require('../../content/quizzes/quiz_08_words.json');
          break;
        case '09':
        case '9':
          quizData = require('../../content/quizzes/quiz_09_festivals.json');
          break;
        case '10':
          quizData = require('../../content/quizzes/quiz_10_colors.json');
          break;
        default:
          throw new Error(`Quiz ${moduleId} not found`);
      }

      // Cache it
      this.quizCache.set(moduleId, quizData);
      return quizData;
    } catch (error) {
      console.error(`Error loading quiz ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Get all available modules
   */
  async getAllModules(): Promise<any[]> {
    const moduleIds = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
    const modules = [];

    for (const id of moduleIds) {
      try {
        const module = await this.getModule(id);
        modules.push(module);
      } catch (error) {
        console.error(`Failed to load module ${id}:`, error);
      }
    }

    return modules;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.moduleCache.clear();
    this.quizCache.clear();
  }
}

export const contentLoader = new ContentLoader();
