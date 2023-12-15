from app import app, db  # Import the Flask app instance
from app import User, ResearchPaper

# Create an application context
with app.app_context():
    # Confirm before deletion
    confirm = input("Are you sure you want to delete all user data? (y/n): ")
    if confirm.lower() == 'y':
        # Delete all user data
        db.session.query(User).delete()
        db.session.query(ResearchPaper).delete()

        # Commit the changes
        db.session.commit()
        print("All user data has been deleted.")
    else:
        print("Operation cancelled.")
