package assignment9;

public class ArrayLinkedList {
	Node head;
	int size;
	ArrayLinkedList(){
		head = new Node();
	}
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		toString(sb, head);
		return sb.toString();
		
	}
	private void toString(StringBuilder sb, Node n) {
		if(n==null) return;
		if(n.value != null) sb.append(" " + n.value);
		toString(sb, n.next);
	}
	
	class Node {
		String value;
		Node next;
		Node previous;
		
		public String toString() {
			return value == null ? "null" : value;
		}
	}
	
	public void push(String item) {
		size++;
		
		Node pred = head;
    	Node succ = head.next;
    
    	Node newNode = new Node();
    	newNode.value = item;
    	newNode.next = succ;
    	newNode.previous = pred;
    	pred.next = newNode;
	}

	public String pop(String item) {
		if (isEmpty()) {
			throw new IndexOutOfBoundsException("Stack is empty");
		}
		Node currentNode = head;
	        while(currentNode != null && currentNode.next != null) {
	        	 if(currentNode.next.value == item) {
	        		 currentNode.next = currentNode.next.next;
	        	 }else {
	        		 currentNode = currentNode.next;
	        	 }
	        	 
	        }
	    System.out.println("Removed Node: " + item);
	    size--;
		return item;

	}

	public String peek() {
		if (isEmpty()) {
			  throw new IndexOutOfBoundsException("Stack is empty");
		}
		return head.next.value;
	}

	public boolean isEmpty() {
		return (size == 0 || head == null);
	}
	
	public int size() {
		return size;
	}
}
