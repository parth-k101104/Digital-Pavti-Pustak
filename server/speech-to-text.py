#!/usr/bin/env python3
"""
Offline Speech-to-Text Donor Entry System
Supports multiple speech recognition engines for offline operation
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import speech_recognition as sr
import pyttsx3
import threading
import json
import os
from datetime import datetime
import re
import queue
import time

class OfflineSpeechToText:
    def __init__(self):
        # Initialize main window
        self.root = tk.Tk()
        self.root.title("Offline Speech-to-Text Donor Entry System")
        self.root.geometry("800x700")
        self.root.configure(bg='#f0f0f0')
        
        # Speech recognition setup
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Text-to-speech setup
        self.tts_engine = pyttsx3.init()
        self.tts_engine.setProperty('rate', 150)
        
        # Data storage
        self.donors_file = "donors_data.json"
        self.donors = self.load_donors()
        
        # Threading and state management
        self.is_listening = False
        self.current_field = None
        self.audio_queue = queue.Queue()
        
        # Create GUI
        self.create_widgets()
        self.setup_microphone()
        
    def create_widgets(self):
        """Create the main GUI interface"""
        # Main frame
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="🎤 Speech Donor Entry System", 
                               font=('Arial', 20, 'bold'))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # Status display
        self.status_var = tk.StringVar(value="Ready - Click microphone buttons to start voice input")
        status_frame = ttk.LabelFrame(main_frame, text="Status", padding="10")
        status_frame.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        status_frame.columnconfigure(0, weight=1)
        
        self.status_label = ttk.Label(status_frame, textvariable=self.status_var, 
                                     font=('Arial', 10), foreground='blue')
        self.status_label.grid(row=0, column=0, sticky=(tk.W, tk.E))
        
        # Donor information form
        form_frame = ttk.LabelFrame(main_frame, text="Donor Information", padding="15")
        form_frame.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 15))
        form_frame.columnconfigure(1, weight=1)
        
        # Donor Name
        ttk.Label(form_frame, text="Donor Name:", font=('Arial', 11, 'bold')).grid(
            row=0, column=0, sticky=tk.W, pady=(0, 10))
        
        self.name_var = tk.StringVar()
        self.name_entry = ttk.Entry(form_frame, textvariable=self.name_var, 
                                   font=('Arial', 11), width=40)
        self.name_entry.grid(row=0, column=1, sticky=(tk.W, tk.E), padx=(10, 5), pady=(0, 10))
        
        self.name_mic_btn = ttk.Button(form_frame, text="🎤", width=4,
                                      command=lambda: self.start_voice_input('name'))
        self.name_mic_btn.grid(row=0, column=2, padx=(5, 0), pady=(0, 10))
        
        # Donor Address
        ttk.Label(form_frame, text="Donor Address:", font=('Arial', 11, 'bold')).grid(
            row=1, column=0, sticky=tk.W, pady=(0, 10))
        
        self.address_var = tk.StringVar()
        self.address_entry = ttk.Entry(form_frame, textvariable=self.address_var, 
                                      font=('Arial', 11), width=40)
        self.address_entry.grid(row=1, column=1, sticky=(tk.W, tk.E), padx=(10, 5), pady=(0, 10))
        
        self.address_mic_btn = ttk.Button(form_frame, text="🎤", width=4,
                                         command=lambda: self.start_voice_input('address'))
        self.address_mic_btn.grid(row=1, column=2, padx=(5, 0), pady=(0, 10))
        
        # Donation Amount
        ttk.Label(form_frame, text="Donation Amount:", font=('Arial', 11, 'bold')).grid(
            row=2, column=0, sticky=tk.W, pady=(0, 10))
        
        self.amount_var = tk.StringVar()
        self.amount_entry = ttk.Entry(form_frame, textvariable=self.amount_var, 
                                     font=('Arial', 11), width=40)
        self.amount_entry.grid(row=2, column=1, sticky=(tk.W, tk.E), padx=(10, 5), pady=(0, 10))
        
        self.amount_mic_btn = ttk.Button(form_frame, text="🎤", width=4,
                                        command=lambda: self.start_voice_input('amount'))
        self.amount_mic_btn.grid(row=2, column=2, padx=(5, 0), pady=(0, 10))
        
        # Control buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=3, column=0, columnspan=3, pady=(0, 15))
        
        self.save_btn = ttk.Button(button_frame, text="Save Donor", 
                                  command=self.save_donor, style='Accent.TButton')
        self.save_btn.grid(row=0, column=0, padx=(0, 10))
        
        self.clear_btn = ttk.Button(button_frame, text="Clear Form", 
                                   command=self.clear_form)
        self.clear_btn.grid(row=0, column=1, padx=(0, 10))
        
        self.stop_btn = ttk.Button(button_frame, text="Stop Listening", 
                                  command=self.stop_listening, state='disabled')
        self.stop_btn.grid(row=0, column=2)
        
        # Donor history
        history_frame = ttk.LabelFrame(main_frame, text="Donor History", padding="10")
        history_frame.grid(row=4, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S))
        history_frame.columnconfigure(0, weight=1)
        history_frame.rowconfigure(0, weight=1)
        
        self.history_text = scrolledtext.ScrolledText(history_frame, height=12, 
                                                     font=('Arial', 10))
        self.history_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure main grid weights
        main_frame.rowconfigure(4, weight=1)
        
        # Load and display existing donors
        self.update_history_display()
        
    def setup_microphone(self):
        """Setup and calibrate microphone for ambient noise"""
        try:
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
            self.update_status("Microphone calibrated successfully", "info")
        except Exception as e:
            self.update_status(f"Microphone setup error: {str(e)}", "error")
    
    def start_voice_input(self, field_type):
        """Start voice input for specified field"""
        if self.is_listening:
            self.update_status("Already listening. Please wait...", "warning")
            return
        
        self.current_field = field_type
        self.is_listening = True
        
        # Update UI
        self.update_mic_buttons_state(True)
        self.update_status(f"Listening for {field_type}... Speak now!", "listening")
        
        # Start listening in separate thread
        listen_thread = threading.Thread(target=self.listen_for_speech)
        listen_thread.daemon = True
        listen_thread.start()
    
    def listen_for_speech(self):
        """Listen for speech and process it"""
        try:
            with self.microphone as source:
                # Listen for audio
                self.update_status(f"Listening for {self.current_field}...", "listening")
                audio = self.recognizer.listen(source, timeout=10, phrase_time_limit=15)
            
            # Process the audio
            self.update_status("Processing speech...", "processing")
            text = self.process_speech(audio)
            
            if text:
                # Process and set the text based on field type
                processed_text = self.process_field_text(text, self.current_field)
                self.set_field_value(self.current_field, processed_text)
                self.update_status(f"Captured: '{processed_text}'", "success")
                
                # Provide audio feedback
                self.speak_confirmation(f"{self.current_field} set to {processed_text}")
            else:
                self.update_status("No speech detected. Please try again.", "warning")
                
        except sr.WaitTimeoutError:
            self.update_status("Listening timeout. Please try again.", "warning")
        except sr.UnknownValueError:
            self.update_status("Could not understand speech. Please try again.", "warning")
        except Exception as e:
            self.update_status(f"Error during speech recognition: {str(e)}", "error")
        finally:
            self.is_listening = False
            self.current_field = None
            self.update_mic_buttons_state(False)
    
    def process_speech(self, audio):
        """Process speech using multiple recognition engines"""
        # Try different engines in order of preference for offline support
        engines = [
            ('sphinx', self.recognizer.recognize_sphinx),  # Offline
            ('google', self.recognizer.recognize_google),  # Online fallback
        ]
        
        for engine_name, engine_func in engines:
            try:
                if engine_name == 'sphinx':
                    # Offline recognition
                    text = engine_func(audio)
                else:
                    # Online recognition
                    text = engine_func(audio)
                
                self.update_status(f"Recognition successful using {engine_name}", "info")
                return text.strip()
                
            except sr.UnknownValueError:
                continue
            except sr.RequestError as e:
                if engine_name == 'sphinx':
                    self.update_status("Offline recognition failed, trying online...", "warning")
                continue
            except Exception as e:
                continue
        
        return None
    
    def process_field_text(self, text, field_type):
        """Process text based on field type"""
        if field_type == 'name':
            return self.process_name(text)
        elif field_type == 'address':
            return self.process_address(text)
        elif field_type == 'amount':
            return self.process_amount(text)
        else:
            return text.strip()
    
    def process_name(self, text):
        """Process donor name - capitalize properly"""
        return ' '.join(word.capitalize() for word in text.split())
    
    def process_address(self, text):
        """Process address - proper capitalization"""
        # Capitalize first letter of each word, handle common abbreviations
        words = text.split()
        processed = []
        
        for word in words:
            # Common address abbreviations
            if word.lower() in ['st', 'rd', 'nd', 'th', 'ave', 'blvd', 'dr', 'ln', 'ct']:
                processed.append(word.upper())
            else:
                processed.append(word.capitalize())
        
        return ' '.join(processed)
    
    def process_amount(self, text):
        """Process donation amount - extract numbers from speech"""
        # Convert spoken numbers to digits
        number_words = {
            'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
            'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
            'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
            'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
            'eighteen': '18', 'nineteen': '19', 'twenty': '20', 'thirty': '30',
            'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
            'eighty': '80', 'ninety': '90', 'hundred': '100', 'thousand': '1000'
        }
        
        # Clean the text
        processed = text.lower()
        processed = re.sub(r'dollars?|bucks?|rupees?|₹|\$', '', processed)
        processed = re.sub(r'\band\b', '', processed)
        
        # Replace number words with digits
        for word, digit in number_words.items():
            processed = re.sub(r'\b' + word + r'\b', digit, processed)
        
        # Extract numbers
        numbers = re.findall(r'\d+', processed)
        if numbers:
            # Handle compound numbers (e.g., "twenty five" -> "25")
            if len(numbers) >= 2:
                # Simple addition for compound numbers
                total = sum(int(num) for num in numbers)
                return str(total)
            else:
                return numbers[0]
        
        # If no numbers found, return original text
        return text.strip()
    
    def set_field_value(self, field_type, value):
        """Set the value in the appropriate field"""
        if field_type == 'name':
            self.name_var.set(value)
        elif field_type == 'address':
            self.address_var.set(value)
        elif field_type == 'amount':
            self.amount_var.set(value)
    
    def speak_confirmation(self, text):
        """Provide audio feedback"""
        try:
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()
        except Exception as e:
            print(f"TTS Error: {e}")
    
    def update_mic_buttons_state(self, listening):
        """Update microphone button states"""
        state = 'disabled' if listening else 'normal'
        self.name_mic_btn.config(state=state)
        self.address_mic_btn.config(state=state)
        self.amount_mic_btn.config(state=state)
        self.stop_btn.config(state='normal' if listening else 'disabled')
    
    def update_status(self, message, status_type="info"):
        """Update status display with color coding"""
        colors = {
            'info': 'blue',
            'success': 'green',
            'warning': 'orange',
            'error': 'red',
            'listening': 'purple',
            'processing': 'dark blue'
        }
        
        self.status_var.set(message)
        self.status_label.config(foreground=colors.get(status_type, 'black'))
        self.root.update_idletasks()
    
    def stop_listening(self):
        """Stop current listening operation"""
        if self.is_listening:
            self.is_listening = False
            self.current_field = None
            self.update_mic_buttons_state(False)
            self.update_status("Listening stopped by user", "warning")
    
    def save_donor(self):
        """Save donor information"""
        name = self.name_var.get().strip()
        address = self.address_var.get().strip()
        amount = self.amount_var.get().strip()
        
        if not all([name, address, amount]):
            messagebox.showerror("Error", "Please fill in all fields")
            return
        
        try:
            amount_float = float(amount)
            if amount_float <= 0:
                raise ValueError("Amount must be positive")
        except ValueError:
            messagebox.showerror("Error", "Please enter a valid donation amount")
            return
        
        # Create donor record
        donor = {
            'id': len(self.donors) + 1,
            'name': name,
            'address': address,
            'amount': amount_float,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Save to list and file
        self.donors.append(donor)
        self.save_donors()
        
        # Update display and clear form
        self.update_history_display()
        self.clear_form()
        
        # Provide feedback
        self.update_status(f"Donor {name} saved successfully!", "success")
        self.speak_confirmation(f"Donor {name} saved successfully")
        
        messagebox.showinfo("Success", f"Donor '{name}' has been saved successfully!")
    
    def clear_form(self):
        """Clear all form fields"""
        self.name_var.set("")
        self.address_var.set("")
        self.amount_var.set("")
        self.update_status("Form cleared", "info")
    
    def load_donors(self):
        """Load donors from file"""
        if os.path.exists(self.donors_file):
            try:
                with open(self.donors_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading donors: {e}")
        return []
    
    def save_donors(self):
        """Save donors to file"""
        try:
            with open(self.donors_file, 'w') as f:
                json.dump(self.donors, f, indent=2)
        except Exception as e:
            print(f"Error saving donors: {e}")
    
    def update_history_display(self):
        """Update the donor history display"""
        self.history_text.delete(1.0, tk.END)
        
        if not self.donors:
            self.history_text.insert(tk.END, "No donors saved yet.\n")
            return
        
        self.history_text.insert(tk.END, f"Total Donors: {len(self.donors)}\n")
        total_amount = sum(donor['amount'] for donor in self.donors)
        self.history_text.insert(tk.END, f"Total Donations: ${total_amount:.2f}\n\n")
        
        for i, donor in enumerate(reversed(self.donors[-10:]), 1):  # Show last 10
            self.history_text.insert(tk.END, 
                f"{i}. {donor['name']}\n"
                f"   📍 {donor['address']}\n"
                f"   💰 ${donor['amount']:.2f}\n"
                f"   📅 {donor['timestamp']}\n\n"
            )
    
    def run(self):
        """Start the application"""
        try:
            self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
            self.root.mainloop()
        except KeyboardInterrupt:
            self.on_closing()
    
    def on_closing(self):
        """Handle application closing"""
        if self.is_listening:
            self.stop_listening()
        
        # Save any pending data
        self.save_donors()
        
        # Close TTS engine
        try:
            self.tts_engine.stop()
        except:
            pass
        
        self.root.destroy()

def main():
    """Main function to run the application"""
    print("Starting Offline Speech-to-Text Donor Entry System...")
    print("Make sure you have the following packages installed:")
    print("pip install speechrecognition pyttsx3 pyaudio pocketsphinx")
    print("\nNote: For offline support, pocketsphinx is required.")
    print("On some systems, you may need to install additional dependencies.")
    
    try:
        app = OfflineSpeechToText()
        app.run()
    except Exception as e:
        print(f"Error starting application: {e}")
        print("\nTroubleshooting:")
        print("1. Install required packages: pip install speechrecognition pyttsx3 pyaudio")
        print("2. For offline support: pip install pocketsphinx")
        print("3. Check microphone permissions")
        print("4. On Linux: sudo apt-get install espeak espeak-data libespeak1 libespeak-dev")
        print("5. On Windows: Ensure Windows Speech Platform is installed")

if __name__ == "__main__":
    main()