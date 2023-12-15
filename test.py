import openai
import requests
from PyPDF2 import PdfReader

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

# Usage in your download_and_summarize_pdf function:

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

url = "https://arxiv.org/pdf/2212.08104v1.pdf"
api_key = "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"


summary = download_and_summarize_pdf(url, api_key)
print(summary)
