const axios = require('axios');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

class MaintenanceService {
  constructor() {
    this.baseURL = 'https://maintenance.imesd.k12.or.us';
    this.jar = new CookieJar();
    this.client = wrapper(axios.create({
      jar: this.jar,
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    }));
    this.authenticated = false;
  }

  async login(username, password) {
    try {
      // First, get the login page to retrieve any CSRF tokens or session cookies
      const loginPageResponse = await this.client.get(`${this.baseURL}/`);

      // Parse the login form to find required fields
      const $ = cheerio.load(loginPageResponse.data);

      // Try to find the login form and its action
      const loginForm = $('form[action*="login"]').first();
      let loginAction = loginForm.attr('action') || '/login';

      // Make sure the action is a full URL
      if (loginAction.startsWith('/')) {
        loginAction = `${this.baseURL}${loginAction}`;
      }

      // Look for any hidden fields (CSRF tokens, etc.)
      const hiddenFields = {};
      loginForm.find('input[type="hidden"]').each((i, elem) => {
        const name = $(elem).attr('name');
        const value = $(elem).attr('value');
        if (name) hiddenFields[name] = value;
      });

      // Attempt login with various common field names
      const loginData = {
        ...hiddenFields,
        username: username,
        password: password,
        user: username,
        pass: password,
        login: username,
        email: username,
      };

      const loginResponse = await this.client.post(loginAction, loginData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': `${this.baseURL}/`,
        },
        maxRedirects: 5,
      });

      // Check if login was successful by looking for common indicators
      const loginHtml = loginResponse.data;
      const isLoginPage = loginHtml.includes('login') &&
                          (loginHtml.includes('password') || loginHtml.includes('username'));

      if (isLoginPage && loginResponse.status !== 200) {
        throw new Error('Login failed - invalid credentials');
      }

      this.authenticated = true;
      this.username = username;
      this.password = password;

      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Login error:', error.message);
      throw new Error(`Failed to authenticate: ${error.message}`);
    }
  }

  async ensureAuthenticated() {
    if (!this.authenticated) {
      throw new Error('Not authenticated. Please login first.');
    }
  }

  async getTickets() {
    await this.ensureAuthenticated();

    try {
      // Try common endpoints for tickets
      const possibleEndpoints = [
        '/tickets',
        '/workorders',
        '/requests',
        '/dashboard',
        '/main',
        '/home',
      ];

      let ticketsData = [];
      let ticketsHtml = '';

      for (const endpoint of possibleEndpoints) {
        try {
          const response = await this.client.get(`${this.baseURL}${endpoint}`);
          ticketsHtml = response.data;

          if (ticketsHtml.includes('ticket') || ticketsHtml.includes('work order')) {
            break;
          }
        } catch (err) {
          continue;
        }
      }

      // Parse the HTML to extract ticket information
      const $ = cheerio.load(ticketsHtml);

      // Look for common table structures
      $('table tr, .ticket, .work-order, .request-item').each((i, elem) => {
        const $elem = $(elem);
        const text = $elem.text().trim();

        if (text && i > 0) { // Skip header row
          const ticket = {
            id: i,
            title: text.substring(0, 100),
            status: this.extractStatus($elem),
            priority: this.extractPriority($elem),
            created_at: new Date().toISOString(),
            description: text,
          };
          ticketsData.push(ticket);
        }
      });

      // If no tickets found, return sample data structure
      if (ticketsData.length === 0) {
        ticketsData = [{
          id: 'sample',
          title: 'Sample Ticket - Real data will appear after proper integration',
          status: 'pending',
          priority: 'normal',
          created_at: new Date().toISOString(),
          description: 'This is a sample ticket. The system is connected but needs proper endpoint configuration.',
          raw_html: ticketsHtml.substring(0, 500) // Include some HTML for debugging
        }];
      }

      return ticketsData;
    } catch (error) {
      console.error('Get tickets error:', error.message);
      throw new Error(`Failed to fetch tickets: ${error.message}`);
    }
  }

  async getTicketDetails(ticketId) {
    await this.ensureAuthenticated();

    try {
      const response = await this.client.get(`${this.baseURL}/ticket/${ticketId}`);
      const $ = cheerio.load(response.data);

      return {
        id: ticketId,
        title: $('h1, .ticket-title').first().text().trim(),
        description: $('.ticket-description, .description').first().text().trim(),
        status: this.extractStatus($('body')),
        priority: this.extractPriority($('body')),
        comments: this.extractComments($),
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Get ticket details error:', error.message);
      throw new Error(`Failed to fetch ticket details: ${error.message}`);
    }
  }

  async respondToTicket(ticketId, message) {
    await this.ensureAuthenticated();

    try {
      // Try to find the comment/response form
      const ticketPageResponse = await this.client.get(`${this.baseURL}/ticket/${ticketId}`);
      const $ = cheerio.load(ticketPageResponse.data);

      const commentForm = $('form[action*="comment"], form[action*="response"]').first();
      const formAction = commentForm.attr('action') || `/ticket/${ticketId}/comment`;

      const hiddenFields = {};
      commentForm.find('input[type="hidden"]').each((i, elem) => {
        const name = $(elem).attr('name');
        const value = $(elem).attr('value');
        if (name) hiddenFields[name] = value;
      });

      const responseData = {
        ...hiddenFields,
        comment: message,
        message: message,
        response: message,
        body: message,
        text: message,
      };

      const fullAction = formAction.startsWith('/') ? `${this.baseURL}${formAction}` : formAction;

      await this.client.post(fullAction, responseData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return { success: true, message: 'Response posted successfully' };
    } catch (error) {
      console.error('Respond to ticket error:', error.message);
      throw new Error(`Failed to post response: ${error.message}`);
    }
  }

  extractStatus($elem) {
    const text = $elem.text().toLowerCase();
    if (text.includes('open')) return 'open';
    if (text.includes('closed')) return 'closed';
    if (text.includes('pending')) return 'pending';
    if (text.includes('in progress')) return 'in_progress';
    if (text.includes('resolved')) return 'resolved';
    return 'unknown';
  }

  extractPriority($elem) {
    const text = $elem.text().toLowerCase();
    if (text.includes('urgent') || text.includes('high')) return 'high';
    if (text.includes('low')) return 'low';
    return 'normal';
  }

  extractComments($) {
    const comments = [];
    $('.comment, .response, .note').each((i, elem) => {
      const $elem = $(elem);
      comments.push({
        id: i,
        text: $elem.text().trim(),
        author: $elem.find('.author, .user').first().text().trim(),
        created_at: new Date().toISOString(),
      });
    });
    return comments;
  }
}

module.exports = MaintenanceService;
