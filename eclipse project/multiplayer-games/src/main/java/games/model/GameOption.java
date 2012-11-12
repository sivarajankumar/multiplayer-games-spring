package games.model;

public abstract class GameOption {

	String name;
	String type;
	String label;
	
	public GameOption(String name, String label, String type) {
		this.name = name;
		this.label = label;
		this.type = type;
	}

	public static class BooleanOption extends GameOption {
		
		boolean defaultValue;

		public BooleanOption(String name, String label, boolean defaultValue) {
			super(name, label, "boolean");
			this.defaultValue = defaultValue;
		}
		
	}
	
	public static class EnumerationOption extends GameOption {
		
		String[] values;
		int defaultValueIndex;
		
		public EnumerationOption(String name, String label, String[] values, int defaultValueIndex) {
			super(name, label, "enumeration");
			this.values = values;
			this.defaultValueIndex = defaultValueIndex;
		}

	}
	
}

