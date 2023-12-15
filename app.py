from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_login import current_user, login_required, login_user, LoginManager
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify

from xml.etree import ElementTree as ET
from werkzeug.utils import secure_filename
import os
import time
import hashlib
import urllib.request
import requests
import openai
from PyPDF2 import PdfReader

from openai_ import openai_api_key


# Initialize Flask App
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)

    name = db.Column(db.String(100), nullable=True)
    title = db.Column(db.String(100), nullable=True)
    affiliation = db.Column(db.String(100), nullable=True)
    specialization = db.Column(db.String(100), nullable=True)
    education = db.Column(db.String(100), nullable=True)
    contact = db.Column(db.String(100), nullable=True)

    paper = db.Column(db.String(100), nullable=True)
    article = db.Column(db.String(100), nullable=True)
    presentation = db.Column(db.String(100), nullable=True)
    project = db.Column(db.String(100), nullable=True)

    profile_picture = db.Column(db.String(120), nullable=True)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class ResearchPaper(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    summary = db.Column(db.Text, nullable=True)
    key_findings = db.Column(db.Text, nullable=True)
    methodology = db.Column(db.Text, nullable=True)
    related_work = db.Column(db.Text, nullable=True)  
    published_date = db.Column(db.String(100), nullable=True)
    updated_date = db.Column(db.String(100), nullable=True)
    comments = db.Column(db.String(200), nullable=True)
    pdf_link = db.Column(db.String(200), nullable=True)
    webpage_link = db.Column(db.String(200), nullable=True)
    categories = db.Column(db.String(200), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def __repr__(self):
        return f"<Paper {self.title}>"


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'login_submit' in request.form:
            # Login Form Submitted
            email = request.form.get('email')
            password = request.form.get('password1')
            user = User.query.filter_by(email=email).first()
            if user and bcrypt.check_password_hash(user.password, password):
                login_user(user)
                return redirect(url_for('main'))
            else:
                flash('Login Unsuccessful. Please check email and password', 'danger')
        elif 'signup_submit' in request.form:  # Check if signup form was submitted
            # Check if username or email already exists
            existing_user = User.query.filter(
                (User.username == request.form['username']) | 
                (User.email == request.form['email'])
            ).first()
            if existing_user:
                flash('Username or Email already exists. Please choose a different one.', 'danger')
                return redirect(url_for('index'))

            # Handle signup
            hashed_password = bcrypt.generate_password_hash(request.form['password1']).decode('utf-8')
            user = User(username=request.form['username'], email=request.form['email'], password=hashed_password)
            db.session.add(user)
            db.session.commit()
            flash('Your account has been created! You are now able to log in', 'success')
            return redirect(url_for('index'))

    return render_template('index.html')


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('Successfully logged out.', 'success')
    return redirect(url_for('index'))

@app.route('/main')
@login_required
def main():
    return render_template('main.html')

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')

@app.route('/editprofile')
@login_required
def editprofile():
    return render_template('editprofile.html', user=current_user)

@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():

    user = User.query.get(current_user.id)
    # Get form data
    user.name = request.form.get('name')
    user.title = request.form.get('title')
    user.affiliation = request.form.get('affiliation')
    user.specialization = request.form.get('specialization')
    user.education = request.form.get('education')
    user.contact = request.form.get('contact')
    
    user.paper = request.form.get('paper')
    user.article = request.form.get('article')
    user.presentation = request.form.get('presentation')
    user.project = request.form.get('project')

    db.session.commit()
    # Redirect to a relevant page, such as the profile view page
    return redirect(url_for('profile'))

@app.route('/update_profile_picture', methods=['POST'])
@login_required
def update_profile_picture():
    file = request.files.get('profile_picture')
    if file and allowed_file(file.filename):
        # Generate a hashed filename
        original_filename = secure_filename(file.filename)
        extension = original_filename.rsplit('.', 1)[1].lower()
        hash_obj = hashlib.sha256()
        hash_obj.update(f'{current_user.id}-{time.time()}'.encode('utf-8'))
        hashed_filename = f'{hash_obj.hexdigest()}.{extension}'

        # Save the file with the new hashed filename
        file_path = os.path.join('static', 'images', hashed_filename)
        file.save(file_path)

        # Store a normalized path in the database
        db_file_path = os.path.join('images', hashed_filename).replace('\\', '/')

        # Check and delete the old picture if it's not the default picture
        old_file_path = current_user.profile_picture
        if old_file_path and old_file_path != 'images/default_picture.jpg':
            full_old_file_path = os.path.join('static', old_file_path)
            if os.path.isfile(full_old_file_path):
                os.remove(full_old_file_path)

        # Update the database with the new file path
        current_user.profile_picture = db_file_path
        db.session.commit()

    else:
        flash('Invalid file type.', 'error')

    return redirect(url_for('profile'))

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/search', methods=['GET'])
def search():
    # Gather filter parameters from the query string
    query = request.args.get('query', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    research_field = request.args.get('research_field', '')
    title_search = request.args.get('title_search', '')
    arxiv_id = request.args.get('arxiv_id', '')
    num_papers = request.args.get('num_papers', '1') # default 1
    sort_by = request.args.get('sort_by', 'relevance')
    sort_order = 'ascending' if sort_by != 'relevance' else ''

    # Construct the search query for arXiv
    filters = []
    if query:
        filters.append(f'all:{query}')
    if research_field:
        filters.append(f'cat:{research_field}')
    if title_search:
        filters.append(f'ti:{title_search}')
    if arxiv_id:
        filters.append(f'id:{arxiv_id}')

    # Combine all filters using AND
    combined_filters = '+AND+'.join(filters) if filters else 'all:'

    # Add date range if both start and end dates are provided
    date_range = f'+AND+submittedDate:[{start_date}+TO+{end_date}]' if start_date and end_date else ''

    # Construct the final URL for the arXiv API
    url_components = [
        f'http://export.arxiv.org/api/query?',
        f'search_query=({combined_filters}){date_range}',
        f'&start=0',
        f'&max_results={num_papers}'
    ]
    if sort_by and sort_order:
        url_components.append(f'&sortBy={sort_by}&sortOrder={sort_order}')

    url = ''.join(url_components)

    try:
        # Call the arXiv API with the constructed URL
        data = urllib.request.urlopen(url).read()
    except urllib.error.URLError as e:
        # Handle URL errors separately
        return jsonify({'error': str(e), 'url': url}), 500

    root = ET.fromstring(data)

    papers = []
    for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):

        # Extract the arXiv ID from the entry ID
        entry_id = entry.find('{http://www.w3.org/2005/Atom}id').text
        arxiv_id = entry_id.split('/')[-1]  # Assuming the format is always consistent

        # Construct the PDF link using the arXiv ID
        pdf_link = f'http://arxiv.org/pdf/{arxiv_id}.pdf'
        print(pdf_link)

        categories = entry.findall('{http://www.w3.org/2005/Atom}category')
        first_category = categories[0].get('term') if categories else ''       
        paper = {
            'id': entry.find('{http://www.w3.org/2005/Atom}id').text,
            'title': entry.find('{http://www.w3.org/2005/Atom}title').text.strip(),
            'summary': entry.find('{http://www.w3.org/2005/Atom}summary').text.strip(),
            'published': entry.find('{http://www.w3.org/2005/Atom}published').text,
            'updated': entry.find('{http://www.w3.org/2005/Atom}updated').text,
            'comments': entry.find('{http://arxiv.org/schemas/atom}comment').text if entry.find('{http://arxiv.org/schemas/atom}comment') is not None else '',
            'pdf_link': pdf_link,  # Store PDF link
            'categories': first_category,
        }
        papers.append(paper)

    return jsonify(papers)

@app.route('/summary')
@login_required
def summary():
    return render_template('summary.html')


@app.route('/save_paper', methods=['POST'])
@login_required
def save_paper():
    try:
        paper_data = request.get_json()
        user = User.query.get(current_user.id)

        # Check if the paper with the same title already exists for the user
        existing_paper = ResearchPaper.query.filter_by(
            title=paper_data['title'],
            user_id=user.id
        ).first()

        # If a paper with the same title already exists, do not save it again
        if existing_paper:
            return jsonify({'success': False, 'message': 'Paper already saved'}), 200

        # # If the paper doesn't exist, create a new one
        # pdf_link = paper_data.get('pdf_link')
        # if not pdf_link:
        #     return jsonify({'error': 'PDF link is required'}), 400

        new_paper = ResearchPaper(
            title=paper_data['title'],
            summary=paper_data.get('summary', ''),
            published_date=paper_data.get('published', ''),
            updated_date=paper_data.get('updated', ''),
            comments=paper_data.get('comments', ''),
            pdf_link=paper_data.get('download_link', ''),
            webpage_link=paper_data.get('webpage_link', ''),
            categories=paper_data.get('categories', ''),
            user_id=user.id
        )
        db.session.add(new_paper)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Paper saved successfully'}), 200
    except Exception as e:
        app.logger.error('Failed to save paper: %s', str(e))
        return jsonify({'success': False, 'error': str(e)}), 500
    
@app.route('/get_paper_details/<int:paper_id>')
@login_required
def get_paper_details(paper_id):
    paper = ResearchPaper.query.get(paper_id)
    if paper and paper.user_id == current_user.id:
        return jsonify({
            'abstract': paper.summary,
            'key_findings': paper.key_findings,
            'methodology': paper.methodology,
            'related_work': paper.related_work
        })
    return jsonify({'error': 'Paper not found'}), 404


@app.route('/delete_paper/<int:paper_id>', methods=['POST'])
@login_required
def delete_paper(paper_id):
    paper = ResearchPaper.query.get(paper_id)
    if paper and paper.user_id == current_user.id:
        try:
            db.session.delete(paper)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Paper deleted successfully'})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    return jsonify({'success': False, 'error': 'Paper not found or user not authorized to delete'}), 404

@app.route('/get_saved_papers')
@login_required
def get_saved_papers():
    user_id = current_user.id
    saved_papers = ResearchPaper.query.filter_by(user_id=user_id).all()
    papers_data = [{'title': paper.title, 'id': paper.id,} for paper in saved_papers]
    # 'pdf_link': paper.pdf_link
    return jsonify(papers_data)


@app.route('/api/summarize_paper/<int:paper_id>', methods=['GET'])
@login_required
def api_summarize_paper(paper_id):
    paper = ResearchPaper.query.get(paper_id)
    if not paper:
        return jsonify({'error': 'Paper not found'}), 404

    try:
        summaries = download_and_summarize_pdf(paper.pdf_link, openai_api_key)
        return jsonify({'summaries': summaries})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def chunk_text(text, max_length):
    """
    Splits the text into chunks, each with a maximum length of max_length.
    """
    words = text.split()
    chunks = []
    current_chunk = []

    for word in words:
        current_chunk.append(word)
        if len(' '.join(current_chunk)) > max_length:
            chunks.append(' '.join(current_chunk[:-1]))
            current_chunk = [word]

    if current_chunk:
        chunks.append(' '.join(current_chunk))

    return chunks

def filter_sections(text, exclude_headers):
    """
    Filter out sections based on exclude_headers.
    """
    lines = text.split('\n')
    filtered_text = []
    skip = False

    for line in lines:
        if any(header in line for header in exclude_headers):
            skip = not skip
            continue
        if not skip:
            filtered_text.append(line)

    return '\n'.join(filtered_text)

def download_and_summarize_pdf(url, api_key):

    # Downloading the PDF
    response = requests.get(url)
    if response.status_code != 200:
        return "Error downloading the PDF file."

    # Saving the PDF locally
    pdf_filename = 'downloaded_file.pdf'
    with open(pdf_filename, 'wb') as f:
        f.write(response.content)

    # Extracting text from the PDF
    reader = PdfReader(pdf_filename)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    exclude_headers = ["Abstract", "Acknowledgements", "References"]
    filtered_text = filter_sections(text, exclude_headers)

    client = openai.OpenAI(api_key=api_key)

    max_chunk_length = 4000  # Adjust based on your needs
    chunks = chunk_text(filtered_text, max_chunk_length)

    # Define your summary prompts
    summary_prompts = [
        "Please provide a detailed summary of the key findings and results from the research paper. Focus on the most significant outcomes, data points, and observations, emphasizing their relevance and impact in the field.",
        "Summarize the methodology and approaches used in the research paper in detail. Detail the techniques, algorithms, or theoretical frameworks employed, including any specific procedures, materials, or tools. Explain how these methods contribute to the reliability and validity of the results.",
        "Provide a detailed overview of the related work as discussed in the research paper. Highlight how this research fits into, challenges, or advances the existing body of knowledge in the field. Discuss the connections, contrasts, and contributions of this paper in relation to previous studies and theories."
    ]

    # Collect summaries for each area
    all_summaries = {prompt: [] for prompt in summary_prompts}
    for prompt in summary_prompts:
        for chunk in chunks:
            try:
                chat_completion = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": chunk}
                    ],
                    model="gpt-3.5-turbo"
                )
                all_summaries[prompt].append(chat_completion.choices[0].message.content)
            except Exception as e:
                all_summaries[prompt].append(f"Error summarizing chunk: {e}")

    # Combine the summaries for each area
    combined_summaries = [summaries for summaries in all_summaries.values()]

    # Flatten the list of summaries
    flattened_summaries = [summary for sublist in combined_summaries for summary in sublist]

    return flattened_summaries

@app.route('/save_summary/<int:paper_id>', methods=['POST'])
@login_required
def save_summary(paper_id):
    paper = ResearchPaper.query.get(paper_id)
    if not paper:
        return jsonify({'error': 'Paper not found'}), 404

    data = request.get_json()

    paper.key_findings = data.get('keyFindings')
    paper.methodology = data.get('methodology')
    paper.related_work = data.get('relatedWork')

    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Summary saved successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

