// Stack-based calculator implementation that respects order-of-operation
// The provided stack is assumed empty initially and is mutated by the calculator during operation.
// User input is represented by one of:
// * a digit: '0','1','2',..,'9'
// * a decimal point: '.'
// * an operator: '*', '/', '+', '-', '='
// The return value represents the calculator's output display.
// Time Complexity is O(1)
// Space Complexity is O(1) - the max stack size is 5
const calculator = (stack, input) => {
    // initialize an empty stack with '0'
    if (stack.length == 0) { stack[0] = '0'; }
    const top = stack[stack.length-1];
    const isNumber = (n) => !isNaN(n);
    // for every digit input
    if (isNumber(input)) {
        // append to the current number, if exists
        // and output the new current number
        if (isNumber(top)) {
            stack[stack.length-1] = top == '0' ? input : top + input;
            return stack[stack.length-1];
        }
        // o/w, start a new number and output it
        // if '=' was last pressed, we pop the previous number before starting a new number
        else {
            if (top == '=') {
                stack.pop(); // pop '='
                stack.pop(); // pop previous number
            }
            stack.push(input);
            return input;
        }
    }
    // for decimal point input
    else if (input == '.') {
        // append it to the current number, if it doesn't already have one
        // and output the current number
        if (isNumber(top)) {
            if (!top.includes('.')) {
                stack[stack.length-1] += '.';
            }
            return stack[stack.length-1];
        }
        // o/w, push '0.' and output it
        // in the case of an '=', we first pop the previous number
        else if (['/','*','-','+','='].includes(top)) {
            if (top == '=') {
                stack.pop(); // pop '='
                stack.pop(); // pop previous number
            }
            stack.push('0.');
            return '0.';
        }
        console.assert(isNumber(stack[stack.length-2]), 
                        'expected to return number; found: ' + stack[stack.length-2]);
        return stack[stack.length-2];
    }
    // for operation inputs: we attempt to simplify the current expression, respecting order of operations.
    // We minimize stack usage by simplifying expressions greedily.
    // In this way, the stack size will always be <= 5 (i.e., space complexity is O(1)).
    else if (['/','*','-','+','='].includes(input)) {
        
        // case 1: The stack has a single number
        //   Here, we simply push the input operator, outputing the number.
        if (stack.length == 1) {
            stack.push(input);
            return stack[0];
        }

        // case 2: The stack has a complete expression (e.g., ['1', '+', '2', '/', '2.1']).
        //   * if the input has lowest precedence (i.e., '+' or '/') or is '='
        //      * we simplify the entire expression, and push the result and input operator onto stack.
        //      * we output the simplified expression result
        //   * if the input has highest precedence (i.e., '*', '/')
        //      * if a product/division sub-expression is on top 
        //          * we simplify it, push the result and input operator, and output the topmost number
        //      * o/w, we simply push the input operator, and output the topmost number
        //   Note: the choice of outputting the topmost number (i.e., most recently evaluated expression) 
        //           is arbitrary; we could just as easily output the bottommost number
        else if (isNumber(top) && stack.length >= 3) {
            const castToErrorOutput = (n) => n == 'Infinity' ? 'Undefined' : n.length > 10 ? 'Error' : n;
            const simplifyTopSubExpr = () => {
                n2 = parseFloat(stack.pop());
                op = stack.pop();
                n1 = parseFloat(stack.pop());
                result = opStringToFunction(op)(n1, n2).toString();
                stack.push(result);
                return castToErrorOutput(result);
            }
            const simplify = () => {
                while (stack.length > 1) { simplifyTopSubExpr(); }
                return castToErrorOutput(stack[0]);
            }
            if (['+','-','='].includes(input)) {
                result = simplify();
                stack.push(input);
                return result;
            }
            else if (['*','/'].includes(input)) {
                if (['*','/'].includes(stack[stack.length-2])) {
                    result = simplifyTopSubExpr();
                    stack.push(input);
                    return result;
                }
                else {
                    stack.push(input);
                    return top;
                }
            }
            else {
                console.error("Unknown operator: " + input);
                return 'EXCEPTION';
            }
        }

        // case 3: The stack has an incomplete expression (e.g., ['1', '+', '2', '/']).
        //   Here, we have two simple behaviors, depending on whether the previous operator was '=':
        //     * if '=' is previous operator: replace with the input operator and output the topmost number
        //     * else: ignore the new input operator and output the top number.
        //   An alternative design recursively executes the calculator on the new input, but
        //     this behavior seems potentially confusing for the user.
        //   Strictness is often better than a non-obvious notion of flexibility.
        else {
            if (top == '=') {
                stack[stack.length-1] = input;
            }
            return stack[stack.length-2];
        }
    }
}

const opStringToFunction = (opStr) => {
    switch(opStr) {
        case '/':
            return (x,y) => x/y;
        case '*':
            return (x,y) => x*y;
        case '+':
            return (x,y) => x+y;
        case '-':
            return (x,y) => x-y;
        default:
            console.error('Unsupported conversion of "' + opStr + '" to function');
    }
}


