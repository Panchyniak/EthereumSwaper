pragma solidity ^0.5.16;

import "./Token.sol";

contract EthSwap {
    // State variable. Because his information is stored in the blockchain.
    string public name = "EthSwap Instant Exchange";
    Token public token; // Creating a variable that represents the token smart contract.
    uint public rate = 100;

    // Defining an event.
    // account: Account who purchased the tokens.
    // amount: Amount of tokens that were purchased.
    // rate: Redemption rate of the purchase. 
    event TokensPurchased(
        address account, 
        address token,
        uint amount,
        uint rate
    );

    // Defining an event.
    // account: Account who purchased the tokens.
    // amount: Amount of tokens that were purchased.
    // rate: Redemption rate of the purchase. 
    event TokensSold(
        address account, 
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    // The function needs to be declared as payable.
    // This will allow us to send ether when calling this function.
    function buyTokens() public payable{

        // Redemption rate = # of tokens they receive for 1 ether.
        // Amount of Ethereum * Redemption rate.
        // msg.value tell us how much ether was sent when this function was called.
        // Calculate the number of tokens to buy.
        uint tokenAmount = msg.value * rate;

        // Guarantees that no one can buy more tokens than the exchange have.
        // The "require" functions is a validation. If the expression inside it
        // returns false, the exection is stopped. Otherwise the execution proceeds.
        // "address(this)" references the address of the smart contract (EthSwap's address).
        require(token.balanceOf(address(this)) >= tokenAmount);

        // msg is a global variable inside of selenity.
        // msg.sender is the value of the address that is calling this function.
        // Transfer tokens to the user.
        token.transfer(msg.sender, tokenAmount);

        // Emit an event.
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {

        // User can't sell more tokens than they have.
        require(token.balanceOf(msg.sender) >= _amount);
    
        // Calculate the amount of Ether to redeem.
        uint etherAmount = _amount / rate;

        // Guarantees that no one can buy more tokens than the exchange have.
        // The "require" functions is a validation. If the expression inside it
        // returns false, the exection is stopped. Otherwise the execution proceeds.
        // "address(this)" references the address of the smart contract (EthSwap's address).
        require(address(this).balance >= etherAmount);

        // Perform sale.
        token.transferFrom(msg.sender, address(this), _amount);
        // "msg.sender.transfer" basically sends an amount of "ether" to the person who is calling this function.
        msg.sender.transfer(etherAmount);

        // Emit an event.
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }

}