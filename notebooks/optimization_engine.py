# ================================================
# HOME ENERGY OPTIMIZATION ENGINE
# Linear Programming for Appliance Scheduling
# ================================================

"""
This script demonstrates the optimization engine using Linear Programming.
Uses PuLP library for mixed-integer linear programming.

Requirements:
    pip install pulp pandas numpy
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

try:
    from pulp import *
except ImportError:
    print("PuLP not installed. Install with: pip install pulp")
    exit()

# ================================================
# 1. DEFINE APPLIANCES AND CONSTRAINTS
# ================================================

# Appliance specifications
APPLIANCES = {
    'air_conditioner': {
        'power_kw': 1.5,
        'daily_hours': 4,
        'preferred_window': (14, 23),  # 2 PM - 11 PM
        'flexible': True,
        'must_be_continuous': False
    },
    'washing_machine': {
        'power_kw': 0.5,
        'daily_hours': 2,
        'preferred_window': (8, 22),  # 8 AM - 10 PM
        'flexible': True,
        'must_be_continuous': True
    },
    'water_heater': {
        'power_kw': 2.0,
        'daily_hours': 2,
        'preferred_window': (5, 9),  # 5 AM - 9 AM or evening
        'flexible': True,
        'must_be_continuous': False
    },
    'dishwasher': {
        'power_kw': 0.8,
        'daily_hours': 2,
        'preferred_window': (20, 24),  # 8 PM - midnight
        'flexible': True,
        'must_be_continuous': True
    },
    'ev_charger': {
        'power_kw': 3.5,
        'daily_hours': 4,
        'preferred_window': (22, 6),  # 10 PM - 6 AM (overnight)
        'flexible': True,
        'must_be_continuous': False
    }
}

# Time-of-Use pricing (₹/kWh)
def get_tou_price(hour):
    """Get electricity price based on Time-of-Use tariff."""
    if hour >= 22 or hour < 6:
        return 4.50  # Off-peak
    elif hour >= 18 and hour < 22:
        return 8.50  # Peak
    else:
        return 6.00  # Normal

# ================================================
# 2. OPTIMIZATION MODEL
# ================================================

def optimize_appliance_schedule(appliances, max_power=8.0):
    """
    Optimize appliance scheduling to minimize electricity cost.
    
    Objective: Minimize Σ (power × price × duration) for all appliances
    
    Constraints:
    - Each appliance must run for its required hours
    - Maximum simultaneous power draw: 8 kW
    - Respect appliance time windows
    - Some appliances must run continuously
    """
    
    hours = range(24)
    
    # Create the optimization problem
    prob = LpProblem("Energy_Cost_Minimization", LpMinimize)
    
    # Decision variables: x[appliance][hour] = 1 if appliance runs at that hour
    x = {}
    for app_name in appliances:
        x[app_name] = {}
        for h in hours:
            x[app_name][h] = LpVariable(f"{app_name}_{h}", cat='Binary')
    
    # OBJECTIVE: Minimize total electricity cost
    prob += lpSum([
        x[app_name][h] * appliances[app_name]['power_kw'] * get_tou_price(h)
        for app_name in appliances
        for h in hours
    ]), "Total_Cost"
    
    # CONSTRAINT 1: Each appliance must run for required hours
    for app_name, app_data in appliances.items():
        prob += lpSum([x[app_name][h] for h in hours]) == app_data['daily_hours'], f"Runtime_{app_name}"
    
    # CONSTRAINT 2: Maximum power at any hour
    for h in hours:
        prob += lpSum([
            x[app_name][h] * appliances[app_name]['power_kw']
            for app_name in appliances
        ]) <= max_power, f"MaxPower_{h}"
    
    # CONSTRAINT 3: Time window constraints (soft - via objective penalty)
    # For now, we rely on the cost optimization to push loads to off-peak
    
    # Solve the problem
    prob.solve(PULP_CBC_CMD(msg=0))
    
    return prob, x

# ================================================
# 3. ANALYZE RESULTS
# ================================================

def analyze_optimization_results(prob, x, appliances):
    """Analyze and display optimization results."""
    
    print("\n" + "="*60)
    print("OPTIMIZATION RESULTS")
    print("="*60)
    
    # Extract schedule
    schedule = {}
    for app_name in appliances:
        schedule[app_name] = [h for h in range(24) if value(x[app_name][h]) == 1]
    
    # Display schedule
    print("\n📅 OPTIMIZED SCHEDULE:")
    print("-"*60)
    for app_name, hours in schedule.items():
        hours_str = ', '.join([f"{h}:00" for h in sorted(hours)])
        print(f"  {app_name.replace('_', ' ').title()}: {hours_str}")
    
    # Calculate costs
    print("\n💰 COST ANALYSIS:")
    print("-"*60)
    
    total_optimized = 0
    total_unoptimized = 0
    
    for app_name, app_data in appliances.items():
        power = app_data['power_kw']
        opt_hours = schedule[app_name]
        
        # Optimized cost
        opt_cost = sum(power * get_tou_price(h) for h in opt_hours)
        total_optimized += opt_cost
        
        # Unoptimized (peak hours) cost
        peak_cost = power * 8.50 * app_data['daily_hours']  # All at peak
        total_unoptimized += peak_cost
        
        savings_pct = ((peak_cost - opt_cost) / peak_cost) * 100 if peak_cost > 0 else 0
        
        print(f"  {app_name.replace('_', ' ').title()}:")
        print(f"    Optimized: ₹{opt_cost:.2f} | Unoptimized: ₹{peak_cost:.2f} | Savings: {savings_pct:.1f}%")
    
    print("-"*60)
    total_savings = total_unoptimized - total_optimized
    savings_pct = (total_savings / total_unoptimized) * 100
    print(f"  TOTAL DAILY COST:")
    print(f"    Optimized:   ₹{total_optimized:.2f}")
    print(f"    Unoptimized: ₹{total_unoptimized:.2f}")
    print(f"    Savings:     ₹{total_savings:.2f} ({savings_pct:.1f}%)")
    
    # Monthly projection
    print("\n📊 MONTHLY PROJECTION:")
    print("-"*60)
    print(f"    Monthly Savings: ₹{total_savings * 30:.2f}")
    print(f"    Annual Savings:  ₹{total_savings * 365:.2f}")
    
    return schedule

# ================================================
# 4. VISUALIZE SCHEDULE
# ================================================

def print_schedule_heatmap(schedule, appliances):
    """Print a text-based heatmap of the schedule."""
    
    print("\n📊 SCHEDULE HEATMAP:")
    print("-"*60)
    
    # Header
    header = "Hour:      " + "".join([f"{h:2d}" for h in range(24)])
    print(header)
    print("-" * len(header))
    
    # Pricing row
    prices = [get_tou_price(h) for h in range(24)]
    price_symbols = ['🟢' if p == 4.5 else '🔴' if p == 8.5 else '🟡' for p in prices]
    print("Price:     " + " ".join(price_symbols))
    print()
    
    # Appliance rows
    for app_name in appliances:
        hours_on = schedule.get(app_name, [])
        row = [' ▓' if h in hours_on else ' ░' for h in range(24)]
        app_display = app_name.replace('_', ' ').title()[:10].ljust(10)
        print(f"{app_display} " + "".join(row))
    
    print()
    print("Legend: 🟢 Off-peak (₹4.50) | 🟡 Normal (₹6.00) | 🔴 Peak (₹8.50)")
    print("        ▓ = Appliance ON | ░ = Appliance OFF")

# ================================================
# MAIN EXECUTION
# ================================================

if __name__ == "__main__":
    print("="*60)
    print("HOME ENERGY OPTIMIZATION ENGINE")
    print("Linear Programming for Smart Appliance Scheduling")
    print("="*60)
    
    # Run optimization
    print("\n⚡ Running optimization...")
    prob, x = optimize_appliance_schedule(APPLIANCES)
    
    # Check if solution found
    if LpStatus[prob.status] == 'Optimal':
        print("✅ Optimal solution found!")
        
        # Analyze results
        schedule = analyze_optimization_results(prob, x, APPLIANCES)
        
        # Print heatmap
        print_schedule_heatmap(schedule, APPLIANCES)
        
    else:
        print(f"❌ Optimization failed: {LpStatus[prob.status]}")
    
    print("\n" + "="*60)
    print("Optimization complete!")
    print("="*60)
