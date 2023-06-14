package assignment9;


public class ArrayLinkedListMain {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		ArrayLinkedList ldk = new ArrayLinkedList();
		ldk.push("Billy");
		ldk.push("Johney");
		ldk.push("White");
		ldk.push("Adam");
		System.out.println("Top print one: " + ldk.peek());
		System.out.println("Size: " + ldk.size());
		System.out.println("Result: " + ldk.toString());
		ldk.pop("Adam");
		System.out.println("Top print one: " + ldk.peek());
		System.out.println("Size: " + ldk.size());
		System.out.println("Result: " + ldk.toString());
		
	}

}
