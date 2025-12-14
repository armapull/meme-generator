import random

def number_guessing_game():
    """A simple number guessing game."""
    print("Welcome to the Number Guessing Game!")
    print("I'm thinking of a number between 1 and 100.")
    print("Can you guess it?\n")
    
    # Generate a random number between 1 and 100
    secret_number = random.randint(1, 100)
    attempts = 0
    max_attempts = 10
    
    while attempts < max_attempts:
        try:
            # Get user's guess
            user_input = input(f"Enter your guess (attempt {attempts + 1}/{max_attempts}, or 'q' to quit): ")
            
            # Allow user to quit
            if user_input.lower() == 'q':
                print(f"\n👋 Thanks for playing! The secret number was {secret_number}.")
                return
            
            guess = int(user_input)
            attempts += 1
            
            # Check if guess is correct
            if guess == secret_number:
                print(f"\n🎉 Congratulations! You guessed it in {attempts} attempt(s)!")
                print(f"The number was {secret_number}.")
                return
            
            # Provide hints
            elif guess < secret_number:
                print("Too low! Try again.")
            else:
                print("Too high! Try again.")
            
            # Show remaining attempts
            remaining = max_attempts - attempts
            if remaining > 0:
                print(f"You have {remaining} attempt(s) left.\n")
        
        except ValueError:
            print("Please enter a valid number!\n")
            continue
    
    # If user runs out of attempts
    print(f"\n😔 Game Over! You ran out of attempts.")
    print(f"The secret number was {secret_number}.")

if __name__ == "__main__":
    number_guessing_game()

