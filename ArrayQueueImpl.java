package assignment9;

import java.util.Arrays;

public class ArrayQueueImpl {

	private int[] arr = new int[10];
	private int front = -1;
	private int rear = 0;

	public int peek() {
		if(isEmpty()) {
			return -1;
		}
		return arr[front];
		
	}

	public void enqueue(int obj) {
		if((rear + 1) == arr.length) resize();
		front = 0;
		arr[rear] = obj;
		rear++;
	}

	public int dequeue() {
		if(isEmpty()) { 
			System.out.println("Queue is Empty");
			return -1;
		}
		
		rear--;
		for (int i = 0; i < arr.length -1; i++) {                
		    
			arr[i] = arr[i +1];
		}
		
		return front;
	}

	public boolean isEmpty() {
		 return (front == -1);
	}

	public int size() {
		return rear;
	}


	private void resize() {
		var tmp = arr.clone();
	    arr = new int[2 * arr.length];
	    for(int i = 0; i < tmp.length; i++) {
	    	arr[i] = tmp[i];
	    }
	}

}
