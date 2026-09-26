/**
 * ============================================================================
 * Task 3: ATM Interface Simulation
 * CodSoft Web Development Internship
 * 
 * Features:
 * - Secure PIN authentication (Demo PIN: 1234)
 * - On-screen tactile keypad + physical keyboard support
 * - Balance inquiry, deposit, withdrawal operations
 * - Transaction ledger with timestamps and local storage persistence
 * - Change PIN capability & demo state reset
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Constants & Storage Keys
  const STORAGE_KEY_BALANCE = 'codsoft_atm_balance';
  const STORAGE_KEY_PIN = 'codsoft_atm_pin';
  const STORAGE_KEY_TX = 'codsoft_atm_transactions';

  const DEFAULT_PIN = '1234';
  const DEFAULT_BALANCE = 10000;

  // State Management
  let currentPin = localStorage.getItem(STORAGE_KEY_PIN) || DEFAULT_PIN;
  let balance = parseFloat(localStorage.getItem(STORAGE_KEY_BALANCE)) || DEFAULT_BALANCE;
  let transactions = [];

  try {
    const savedTx = localStorage.getItem(STORAGE_KEY_TX);
    transactions = savedTx ? JSON.parse(savedTx) : [
      {
        id: 'TX-INIT',
        type: 'Deposit',
        amount: 10000,
        balanceAfter: 10000,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        note: 'Initial Account Deposit'
      }
    ];
  } catch (err) {
    transactions = [];
  }

  // DOM Elements
  const authScreen = document.getElementById('authScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');
  const pinInput = document.getElementById('pinInput');
  const pinDots = document.querySelectorAll('#pinDots .dot');
  const authError = document.getElementById('authError');
  const dashBalanceDisplay = document.getElementById('dashBalanceDisplay');
  const actionBanner = document.getElementById('actionBanner');
  const logoutBtn = document.getElementById('logoutBtn');

  // Keypad
  const keypadKeys = document.querySelectorAll('.key-btn[data-key]');
  const keyClear = document.getElementById('keyClear');
  const keyEnter = document.getElementById('keyEnter');

  // Dashboard Menu Action Buttons
  const btnMenuBalance = document.getElementById('btnMenuBalance');
  const btnMenuDeposit = document.getElementById('btnMenuDeposit');
  const btnMenuWithdraw = document.getElementById('btnMenuWithdraw');
  const btnMenuHistory = document.getElementById('btnMenuHistory');
  const btnMenuChangePin = document.getElementById('btnMenuChangePin');
  const btnResetDemo = document.getElementById('btnResetDemo');

  // Overlay Modal Elements
  const operationOverlay = document.getElementById('operationOverlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayContent = document.getElementById('overlayContent');
  const closeOverlayBtn = document.getElementById('closeOverlayBtn');

  let enteredPin = '';

  /**
   * Currency formatter in Indian Rupees (₹)
   */
  function formatINR(val) {
    return '₹' + Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Save current state to LocalStorage
   */
  function persistState() {
    localStorage.setItem(STORAGE_KEY_BALANCE, balance.toString());
    localStorage.setItem(STORAGE_KEY_PIN, currentPin);
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
  }

  /**
   * Update visual PIN dots
   */
  function updatePinDisplay() {
    pinDots.forEach((dot, idx) => {
      if (idx < enteredPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
    authError.textContent = '';
  }

  /**
   * Authenticate PIN
   */
  function handleLogin() {
    if (enteredPin.length < 4) {
      authError.textContent = 'Please enter a 4-digit PIN.';
      return;
    }

    if (enteredPin === currentPin) {
      authError.textContent = '';
      enteredPin = '';
      updatePinDisplay();
      
      // Transition to Dashboard
      authScreen.classList.remove('active');
      dashboardScreen.classList.add('active');
      dashBalanceDisplay.textContent = formatINR(balance);
      showBanner(`Login successful. Welcome back!`, 'success', 3500);
    } else {
      authError.textContent = 'Incorrect PIN. Default demo PIN is 1234.';
      enteredPin = '';
      updatePinDisplay();
      
      // Add subtle shake animation
      const wrapper = document.querySelector('.pin-dots');
      wrapper.style.transform = 'translateX(-8px)';
      setTimeout(() => wrapper.style.transform = 'translateX(8px)', 80);
      setTimeout(() => wrapper.style.transform = 'translateX(-4px)', 160);
      setTimeout(() => wrapper.style.transform = 'translateX(0)', 240);
    }
  }

  /**
   * Keypad event listeners
   */
  keypadKeys.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      if (enteredPin.length < 4) {
        enteredPin += key;
        updatePinDisplay();
        if (enteredPin.length === 4) {
          // Auto submit on 4th digit for convenience
          setTimeout(handleLogin, 150);
        }
      }
    });
  });

  keyClear.addEventListener('click', () => {
    enteredPin = '';
    updatePinDisplay();
  });

  keyEnter.addEventListener('click', handleLogin);

  // Allow physical keyboard entry on the authentication screen
  document.addEventListener('keydown', (e) => {
    if (!authScreen.classList.contains('active')) return;

    if (e.key >= '0' && e.key <= '9') {
      if (enteredPin.length < 4) {
        enteredPin += e.key;
        updatePinDisplay();
        if (enteredPin.length === 4) {
          setTimeout(handleLogin, 150);
        }
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      enteredPin = enteredPin.slice(0, -1);
      updatePinDisplay();
    } else if (e.key === 'Enter') {
      handleLogin();
    }
  });

  /**
   * Safe Session Logout
   */
  logoutBtn.addEventListener('click', () => {
    dashboardScreen.classList.remove('active');
    authScreen.classList.add('active');
    closeOverlay();
    enteredPin = '';
    updatePinDisplay();
    authError.textContent = 'Session terminated safely.';
  });

  /**
   * Temporary notification banner on dashboard
   */
  let bannerTimer = null;
  function showBanner(message, type = 'success', duration = 4000) {
    if (bannerTimer) clearTimeout(bannerTimer);
    actionBanner.textContent = message;
    actionBanner.className = `action-banner ${type}`;
    bannerTimer = setTimeout(() => {
      actionBanner.className = 'action-banner';
    }, duration);
  }

  /**
   * Modal / Overlay Controllers
   */
  function openOverlay(title, contentHtml) {
    overlayTitle.textContent = title;
    overlayContent.innerHTML = contentHtml;
    operationOverlay.classList.add('active');
  }

  function closeOverlay() {
    operationOverlay.classList.remove('active');
    overlayContent.innerHTML = '';
  }

  closeOverlayBtn.addEventListener('click', closeOverlay);

  // Close overlay on clicking backdrop outside
  operationOverlay.addEventListener('click', (e) => {
    if (e.target === operationOverlay) {
      closeOverlay();
    }
  });

  /**
   * OPERATION 1: CHECK BALANCE
   */
  btnMenuBalance.addEventListener('click', () => {
    const html = `
      <div style="text-align: center; padding: 1.5rem 0;">
        <span style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase;">Current Account Balance</span>
        <h2 style="font-size: 2.2rem; font-family: var(--font-mono); color: #38bdf8; margin: 0.75rem 0;">${formatINR(balance)}</h2>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Account Number: <strong>SB-902384725849</strong></p>
        <button class="atm-action-btn" id="btnBalDone">Return to Menu</button>
      </div>
    `;
    openOverlay('Account Balance Inquiry', html);
    document.getElementById('btnBalDone').addEventListener('click', closeOverlay);
  });

  /**
   * OPERATION 2: DEPOSIT MONEY
   */
  btnMenuDeposit.addEventListener('click', () => {
    const html = `
      <form id="depositForm">
        <div class="atm-form-group">
          <label>Select Quick Amount:</label>
          <div class="quick-amounts">
            <button type="button" class="quick-btn" data-amt="500">+ ₹500</button>
            <button type="button" class="quick-btn" data-amt="1000">+ ₹1,000</button>
            <button type="button" class="quick-btn" data-amt="2000">+ ₹2,000</button>
            <button type="button" class="quick-btn" data-amt="5000">+ ₹5,000</button>
            <button type="button" class="quick-btn" data-amt="10000">+ ₹10,000</button>
            <button type="button" class="quick-btn" data-amt="25000">+ ₹25,000</button>
          </div>
        </div>

        <div class="atm-form-group">
          <label for="depositAmount">Or Enter Custom Deposit Amount (₹):</label>
          <input 
            type="number" 
            id="depositAmount" 
            class="atm-input" 
            placeholder="Min ₹100, Max ₹1,00,000"
            min="100" 
            max="100000" 
            step="100"
            required
          >
          <span class="error-banner" id="depositError"></span>
        </div>

        <button type="submit" class="atm-action-btn">Confirm Deposit</button>
      </form>
    `;
    openOverlay('Deposit Money', html);

    const form = document.getElementById('depositForm');
    const input = document.getElementById('depositAmount');
    const errorEl = document.getElementById('depositError');

    // Quick select buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.getAttribute('data-amt');
        errorEl.textContent = '';
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseFloat(input.value);

      if (isNaN(val) || val <= 0) {
        errorEl.textContent = 'Please enter a valid positive deposit amount.';
        return;
      }
      if (val < 100) {
        errorEl.textContent = 'Minimum deposit amount is ₹100.';
        return;
      }
      if (val > 100000) {
        errorEl.textContent = 'Maximum cash deposit per transaction is ₹1,00,000.';
        return;
      }

      // Execute deposit
      balance += val;
      const tx = {
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        type: 'Deposit',
        amount: val,
        balanceAfter: balance,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        note: 'Cash Deposit at Kiosk'
      };

      transactions.unshift(tx);
      persistState();

      dashBalanceDisplay.textContent = formatINR(balance);
      closeOverlay();
      showBanner(`Successfully deposited ${formatINR(val)} into your account!`, 'success');
    });
  });

  /**
   * OPERATION 3: WITHDRAW MONEY
   */
  btnMenuWithdraw.addEventListener('click', () => {
    const html = `
      <form id="withdrawForm">
        <div class="atm-form-group">
          <label>Select Quick Cash Amount:</label>
          <div class="quick-amounts">
            <button type="button" class="quick-btn" data-amt="500">₹500</button>
            <button type="button" class="quick-btn" data-amt="1000">₹1,000</button>
            <button type="button" class="quick-btn" data-amt="2000">₹2,000</button>
            <button type="button" class="quick-btn" data-amt="5000">₹5,000</button>
            <button type="button" class="quick-btn" data-amt="10000">₹10,000</button>
            <button type="button" class="quick-btn" data-amt="20000">₹20,000</button>
          </div>
        </div>

        <div class="atm-form-group">
          <label for="withdrawAmount">Or Enter Custom Withdrawal Amount (₹):</label>
          <input 
            type="number" 
            id="withdrawAmount" 
            class="atm-input" 
            placeholder="Multiples of 100"
            min="100" 
            step="100"
            required
          >
          <span class="error-banner" id="withdrawError"></span>
        </div>

        <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Available Balance: <strong style="color: #38bdf8;">${formatINR(balance)}</strong>
        </p>

        <button type="submit" class="atm-action-btn" style="background: #2563eb;">Dispense Cash</button>
      </form>
    `;
    openOverlay('Withdraw Money', html);

    const form = document.getElementById('withdrawForm');
    const input = document.getElementById('withdrawAmount');
    const errorEl = document.getElementById('withdrawError');

    // Quick select buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.getAttribute('data-amt');
        errorEl.textContent = '';
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseFloat(input.value);

      if (isNaN(val) || val <= 0) {
        errorEl.textContent = 'Please enter a valid positive withdrawal amount.';
        return;
      }
      if (val % 100 !== 0) {
        errorEl.textContent = 'ATM dispense unit requires amounts in multiples of ₹100.';
        return;
      }
      if (val > balance) {
        errorEl.textContent = `Insufficient funds! Available balance is only ${formatINR(balance)}.`;
        return;
      }
      if (val > 25000) {
        errorEl.textContent = 'Single transaction withdrawal limit is ₹25,000.';
        return;
      }

      // Execute withdrawal
      balance -= val;
      const tx = {
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        type: 'Withdrawal',
        amount: val,
        balanceAfter: balance,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        note: 'ATM Cash Withdrawal'
      };

      transactions.unshift(tx);
      persistState();

      dashBalanceDisplay.textContent = formatINR(balance);
      closeOverlay();
      showBanner(`Cash dispensed: ${formatINR(val)}. Please collect your cash from the slot!`, 'success');
    });
  });

  /**
   * OPERATION 4: TRANSACTION HISTORY
   */
  btnMenuHistory.addEventListener('click', () => {
    let rowsHtml = '';
    if (transactions.length === 0) {
      rowsHtml = `<tr><td colspan="4" class="tx-empty">No transaction history recorded yet.</td></tr>`;
    } else {
      rowsHtml = transactions.map(tx => {
        const isDep = tx.type === 'Deposit';
        return `
          <tr>
            <td>
              <span class="tx-type ${isDep ? 'deposit' : 'withdraw'}">
                ${isDep ? '↓ DEPOSIT' : '↑ WITHDRAW'}
              </span>
            </td>
            <td class="tx-amount" style="color: ${isDep ? '#34d399' : '#f87171'}">
              ${isDep ? '+' : '-'}${formatINR(tx.amount)}
            </td>
            <td style="font-family: var(--font-mono); font-size: 0.76rem; color: var(--text-secondary);">
              ${tx.date}
            </td>
            <td style="font-family: var(--font-mono); font-size: 0.78rem;">
              ${formatINR(tx.balanceAfter)}
            </td>
          </tr>
        `;
      }).join('');
    }

    const html = `
      <div class="tx-table-wrapper">
        <table class="tx-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Date / Time</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      <button class="atm-action-btn" id="btnHistDone" style="margin-top: 1.25rem;">Close History</button>
    `;

    openOverlay('Transaction History Log', html);
    document.getElementById('btnHistDone').addEventListener('click', closeOverlay);
  });

  /**
   * OPERATION 5: CHANGE PIN
   */
  btnMenuChangePin.addEventListener('click', () => {
    const html = `
      <form id="changePinForm">
        <div class="atm-form-group">
          <label for="oldPin">Current 4-Digit PIN:</label>
          <input 
            type="password" 
            id="oldPin" 
            class="atm-input" 
            maxlength="4" 
            placeholder="••••" 
            autocomplete="off"
            required
          >
        </div>

        <div class="atm-form-group">
          <label for="newPin">New 4-Digit PIN:</label>
          <input 
            type="password" 
            id="newPin" 
            class="atm-input" 
            maxlength="4" 
            placeholder="••••" 
            autocomplete="off"
            required
          >
        </div>

        <div class="atm-form-group">
          <label for="confirmPin">Confirm New PIN:</label>
          <input 
            type="password" 
            id="confirmPin" 
            class="atm-input" 
            maxlength="4" 
            placeholder="••••" 
            autocomplete="off"
            required
          >
          <span class="error-banner" id="pinChangeError"></span>
        </div>

        <button type="submit" class="atm-action-btn">Update Security PIN</button>
      </form>
    `;
    openOverlay('Change Security PIN', html);

    const form = document.getElementById('changePinForm');
    const oldPinIn = document.getElementById('oldPin');
    const newPinIn = document.getElementById('newPin');
    const confirmPinIn = document.getElementById('confirmPin');
    const errorEl = document.getElementById('pinChangeError');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const oldVal = oldPinIn.value.trim();
      const newVal = newPinIn.value.trim();
      const confirmVal = confirmPinIn.value.trim();

      if (oldVal !== currentPin) {
        errorEl.textContent = 'Current PIN is incorrect.';
        return;
      }
      if (!/^\d{4}$/.test(newVal)) {
        errorEl.textContent = 'New PIN must be exactly 4 numerical digits.';
        return;
      }
      if (newVal === oldVal) {
        errorEl.textContent = 'New PIN cannot be the same as your old PIN.';
        return;
      }
      if (newVal !== confirmVal) {
        errorEl.textContent = 'New PIN and confirmation PIN do not match.';
        return;
      }

      currentPin = newVal;
      persistState();
      closeOverlay();
      showBanner(`Security PIN changed successfully! Please remember your new PIN: ${newVal}`, 'success', 6000);
    });
  });

  /**
   * RESET DEMO DATA
   */
  btnResetDemo.addEventListener('click', () => {
    if (confirm('Reset ATM balance back to ₹10,000 and PIN to 1234?')) {
      balance = DEFAULT_BALANCE;
      currentPin = DEFAULT_PIN;
      transactions = [
        {
          id: 'TX-RESET',
          type: 'Deposit',
          amount: 10000,
          balanceAfter: 10000,
          date: new Date().toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          }),
          note: 'Reset to Demo State'
        }
      ];
      persistState();
      dashBalanceDisplay.textContent = formatINR(balance);
      showBanner('ATM simulation restored to initial demo state (₹10,000 / PIN: 1234).', 'success');
    }
  });

  // Initial balance format
  dashBalanceDisplay.textContent = formatINR(balance);
});
