print("Welocome to the tip calculator")
bill = float(input("What was the total bill?\n"))
tip = int(input("How much tip would you like to give? 10 , 12, 15\n"))
people = int(input("How many people to split the bill?\n"))

tip_percentage = tip / 100
tip_total_bill = bill * tip_percentage
total_bill = bill + tip_total_bill
bill_devide_to_people = total_bill / people

print(f"Each person should pay : ${bill_devide_to_people:.2f}")
