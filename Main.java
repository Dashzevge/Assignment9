package assignment9;

public class Main {

	public static void main(String[] args) {
		ArrayQueueImpl q = new ArrayQueueImpl();
		q.enqueue(10);
		q.enqueue(4);
		q.enqueue(5);
		q.enqueue(6);
		q.enqueue(7);
		q.enqueue(5);
        System.out.println("Result: " + q.size());
    	q.dequeue();
    	System.out.println("Result: " + q.size());
	}

}
